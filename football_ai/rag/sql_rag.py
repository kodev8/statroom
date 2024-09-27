import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler
from langchain.schema.output import LLMResult
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_ollama import ChatOllama
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain.agents import create_react_agent, AgentExecutor
from langgraph.prebuilt import create_react_agent as cra
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from typing import Callable, Any, Optional
import asyncio
import aioconsole  # pip install aioconsole
from .prompts import column_descriptions, context, sql_system_message
from langchain import hub
from langchain_core.prompts import MessagesPlaceholder
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import HumanMessage, SystemMessage
from typing import AsyncIterator, AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from dotenv import load_dotenv
from collections import defaultdict
import json
from pathlib import Path

load_dotenv()

ASYNC_MODE = True
FINAL_ANSWER = "Final Answer: "
ROOT_DIR = Path(__file__).parent.parent

class ModelLLM():

    options = {
        "google": ChatGoogleGenerativeAI,
        "groq": ChatGroq
    }

    def __init__(
        self, 
        caller, 
        model: str, 
        temperature: int = 0, 
        max_tokens: int = None, 
        timeout: int = None, 
        max_retries: int = 2, 
        streaming: bool = False, 
        callbacks: list = [], 
        handle_parse_errors: bool = True 
        ):
        self._llm = self.choose_caller(caller)(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=timeout,
            max_retries=max_retries,
            streaming=streaming,
            callbacks=callbacks,
        )


    def choose_caller(self, option):
        return self.options.get(option, ChatOllama)

    def get_llm(self):
        return self._llm
        
class AsyncCallbackHandler(AsyncIteratorCallbackHandler):
    content: str = ""
    final_answer: bool = False
    
    def __init__(self, final_answer_pre_callback: Callable, token_callback: Callable) -> None:
        super().__init__()
        self.final_answer_pre_callback = final_answer_pre_callback
        self.token_callback = token_callback
        self.first_colon_hit = False

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        # print("On llm new token")
        self.content += token
        if "Final Answer" in self.content:
            await self.final_answer_pre_callback()
            self.final_answer = True
            self.content = ""

        if self.final_answer:
            if not self.first_colon_hit:
                if ":" in token:
                    self.first_colon_hit = True
                proc_token = token.lstrip(FINAL_ANSWER)

            else:
                proc_token = token        
            await self.token_callback(proc_token)

    
    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        try:
            if self.final_answer:
                self.content = ""
                self.final_answer = False
                self.done.set()
            else:
                self.content = ""

        except Exception as e:
            print(f"Error in on_llm_end: {e}")


class SQLAgent:
    def __init__(self, 
                detection_db_path: str, 
                memory_db_path: str, 
                project_id: str,
                video_id: str,
                final_answer_pre_callback: Optional[Callable] = None,
                token_callback: Optional[Callable] = None,
                service: str = "local"
                ) -> None:
                
        if not project_id:
            raise ValueError("Project ID is required")

        if not token_callback:
            async def token_print(token):
                print(token, end="", flush=True)
            token_callback = token_print

        if not final_answer_pre_callback:
            async def final_answer_print():
                print("Final Answer Found")
            final_answer_pre_callback = final_answer_print

        self.stream_handler = AsyncCallbackHandler(final_answer_pre_callback, token_callback)

        service_models = { 
            "google": "gemini-1.5-pro",
            "local": "llama3.1",
            "groq": "llama-3.1-70b-versatile"
        }

        self.llm = ModelLLM(
            caller=service,
            model=service_models[service],
            callbacks=[self.stream_handler],
            streaming=True
        ).get_llm()

        # create config for project id
        self.config = { 
            "configurable": {
                "session_id": project_id,
                "thread_id": "1"
            }, 
            "metadata": defaultdict(dict)
        }

        prompt_template = hub.pull("langchain-ai/sql-agent-system-prompt")
        self.base_system_message = prompt_template.format(dialect="SQLite", top_k=5)
        
        # Database setup
        self.detection_db = SQLDatabase.from_uri(f"sqlite:///{(ROOT_DIR / detection_db_path).as_posix()}")
        
        # Initialize memory and agent
        # self.memory_async = AsyncSqliteSaver.from_conn_string(f"sqlite:///{(ROOT_DIR / memory_db_path).as_posix()}")
        self.memory_async = AsyncSqliteSaver.from_conn_string(f"sqlite:///../{memory_db_path}")

        # Initialize toolkit and tools
        self.toolkit = SQLDatabaseToolkit(db=self.detection_db, llm=self.llm)
        self.tools = self.toolkit.get_tools()
        
        # Format tools string
        self.tools_str = "\n".join([f"Name: {tool.name}, Description: {tool.description}\n" 
                                   for tool in self.tools])

        self.system_message_langgraph = sql_system_message.format(
            base_system_message=self.base_system_message,
            context=context,
            tables=self.detection_db.get_usable_table_names(),
            table_info=self.detection_db.get_table_info(),
            column_descriptions=column_descriptions,
            tools_str=self.tools_str,
            project_id=project_id,
            video_id=video_id,
            chat_history="",
            tool_names="",
            tools="",
            agent_scratchpad="",
        )


class SQLAgentLanggraph(SQLAgent):
    def __init__(self, 
                detection_db_path: str = 'detections.db',
                memory_db_path: str = 'memory.db', 
                service: str = 'groq',
                video_id: str = None, 
                project_id: str = None,
                final_answer_pre_callback: Any = None,
                token_callback: Any = None
            ) -> None:
        super().__init__(
            detection_db_path=detection_db_path,
            memory_db_path=memory_db_path,
            project_id=project_id,
            video_id=video_id,
            service=service,
            final_answer_pre_callback=final_answer_pre_callback,
            token_callback=token_callback
        )

        self.base_prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_message_langgraph),
            ("human", "{messages}")
        ])

        self.llm_with_tools = self.llm.bind_tools(self.tools)

    async def process_question(self, question: str, sender: str):
        #  used to consume the generator and run the callback handler

        async with self.memory_async as memory:
            self.agent_executor = cra(
                self.llm_with_tools,
                tools=self.tools,
                state_modifier=self.base_prompt,
                checkpointer=memory,
            )

            self.config['metadata']['sender'] = sender
            async for _event in self.agent_executor.astream_events(
                {"messages": question},
                self.config,
                version="v1"
            ):
                continue

    async def create_generator(self, question: str, sender: str) -> AsyncGenerator:
        task = asyncio.create_task(self.process_question(question, sender))
        async for token in self.stream_handler.aiter():
            yield token
        await task
            

class SQLMessageHistory():
    def __init__(self, project_id: str, memory_db_path: str = "memory.db") -> None:
        self.project_id = project_id
        self.raw_memory = create_engine(f"sqlite:///{(ROOT_DIR / memory_db_path).as_posix()}")

    def get_history(self):
        with self.raw_memory.connect() as conn:
            query_text = """
            WITH json_data AS (
                SELECT *,
                    json_extract(metadata, '$.writes.agent.messages[0].kwargs.response_metadata.finish_reason') as finish_reason,
                    json_extract(metadata, '$.writes.agent.messages[0].kwargs.tool_calls') as tool_calls,
                    json_extract(metadata, '$.source') as source,
                    json_extract(metadata, '$.session_id') as session_id,
                    json_extract(metadata, '$.sender') as sender
                FROM checkpoints
            )
            SELECT 
                thread_id, 
                checkpoint_id, 
                metadata,
                sender,
                tool_calls
            FROM json_data
            WHERE thread_id = 1
            AND (
                LOWER(finish_reason) = 'stop'
                OR source = 'input'
            )
            AND session_id = :project_id
			AND (tool_calls IS NULL OR tool_calls = '[]')

            ORDER BY checkpoint_id DESC
            """
            query = conn.execute(text(query_text), {"project_id": self.project_id})
            messages = []
            for row in query:
                message_metadata = json.loads(row[2])
                message_id = row[1]
                writes = message_metadata.get('writes')
                if writes.get('agent'):
                    message = writes['agent']['messages'][0]['kwargs']['content'].lstrip(FINAL_ANSWER)
                    # skip tool messages
                    if message == "":
                        continue
                    messages.append({
                        "id": message_id,
                        "sender": "system",
                        "message": message
                        })
                elif writes.get('__start__'):
                    message = writes['__start__']['messages']
                    sender = message_metadata.get('sender')
                    messages.append({ 
                        "id": message_id,
                        "sender": sender,
                        "message": message
                    })

        return messages


async def main_langgraph():

    agent = SQLAgentLanggraph(
        "detections.db", 
        'memory.db', 
        service="google",
        project_id="4",
        video_id="4-5902e3c6-4426-479d-ad0b-bad80f866740"

        )

    # while question := await aioconsole.ainput("\nEnter your question: "):
    #     if question.lower() == 'quit':
    #         break
    #     # print("MEMORY: ", agent.memory)
    question = "What are you capable of doing?"

    await agent.process_question(question, "tester")
        # except Exception as e:
        #     print(f"Error: {e}")
if __name__ == "__main__":
    asyncio.run(main_langgraph())
    # asyncio.run(main())

# example question: using the player's bounding boxes, get the tracker id of the player that covered the most distance

# class SQLAgentLanggraph(SQLAgent):
#     def __init__(self, detection_db_path: str = '../detection.db',memory_db_path: str = '../memory.db', service = 'groq', project_id=None) -> None:

#         super().__init__(
#             detection_db_path=detection_db_path, 
#             memory_db_path=memory_db_path,
#             project_id=project_id,
#             service=service
#             )

#         self.base_prompt = ChatPromptTemplate.from_messages([
#              ("system", self.system_message_langgraph),
#             #  MessagesPlaceholder(variable_name="chat_history"),
#             ("human", "{messages}")
#         ])
#         self.llm_with_tools = self.llm.bind_tools(self.tools)

       

#     async def process_question(self, question: str):

#         async with self.memory_async as memory:
#             self.agent_executor = cra(
#                     self.llm_with_tools, 
#                     tools=self.tools,
#                     state_modifier=self.base_prompt,
#                     checkpointer=memory,
#             )

#             # print(dir(self.agent.checkpointer.serde))

#             async for token in self.agent_executor.astream(
#                 {"messages": question}, 
#                 self.config,
#                 stream_mode='values'
#             ):
#                 if isinstance(token['messages'][-1], HumanMessage):
#                     continue

#                 yield token['messages'][-1].content.lstrip(FINAL_ANSWER))

    
                
             
#                 # print(token['messages'][-1].content.lstrip(FINAL_ANSWER)), end="", flush=True)
#                 # token['messages'][-1].pretty_print()

#             # (token.text, end="", flush=True)
    
#     def show_history(self, project_id: str):

#         conn = self.raw_memory.connect()
#         conn.execute(
#             """
#             SELECT thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, type, checkpoint, metadata
#             FROM checkpoints
#             WHERE thread_id = 1 AND (
#                     json_extract(CAST(metadata AS TEXT), '$.writes.agent.messages[0].kwargs.response_metadata.finish_reason') = "STOP"
#                     OR
#                     json_extract(CAST(metadata AS TEXT), '$.source') = "input"
#                     )
#             ORDER BY checkpoint_id DESC
#             """

#         )

#         for i in query:
#             print(i)

        
        
        

                
#                 # print(i.metadata['writes']['agent']['messages'][0].content.lstrip(FINAL_ANSWER)))
#                 # print(i['metatdata']['writes']['agent']['messages'][0]['kwargs']['content'])

# class SQLAgentLangchain(SQLAgent):

#     def __init__(self, db_path: str, service: str = "local") -> None:
#         super().__init__(db_path, service)
#         self.agent_executor = self._create_agent()
    

#     def _create_agent(self):

#         chat_prompt = ChatPromptTemplate.from_messages([
#              ("system", self.system_message),
#             ("human", "{input}")
#         ]
#         )
#         agent = create_react_agent(
#             self.llm, 
#             self.tools, 
#             chat_prompt,
#         )


#         return RunnableWithMessageHistory(
#             AgentExecutor(agent=agent, tools=self.tools),
#             lambda session_id: self.memory,
#             input_messages_key="input",
#             history_messages_key="chat_history",
#         )

#     async def process_question(self, question: str) -> None:
#         try:
#             generator = self._create_generator(question)
#             async for token in generator:
#                 print(token, end="", flush=True)
#                 sys.stdout.write(token)
#                 sys.stdout.flush()
#         except Exception as e:
#             print(f"\nError processing question: {e}")
#         finally:
#             # Reset the callback handler
#             self.stream_handler.content = ""
#             self.stream_handler.final_answer = False

#     async def _create_generator(self, question: str):
#         task = asyncio.create_task(self._run_call(question))
#         async for token in self.stream_handler.aiter():
#             yield token
#         await task

#     async def _run_call(self, question: str):
#         await self.agent_executor.ainvoke(
#             {"input": question,
#             },
#             {"configurable": {"session_id": "football_ai"}}

#         )

    #   self.system_message = sql_system_message.format(
    #         base_system_message=self.base_system_message,
    #         context=context,
    #         tables=self.detection_db.get_usable_table_names(),
    #         table_info=self.detection_db.get_table_info(),
    #         column_descriptions=column_descriptions,
    #         tools_str=self.tools_str,
    #         chat_history="",
    #         project_id=project_id,
    #         video_id=video_id,
    #         tool_names="{tool_names}",
    #         tools="{tools}",
    #         agent_scratchpad="{agent_scratchpad}",
    #     )