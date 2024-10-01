### References:
- drop down click vs hover
https://github.com/radix-ui/primitives/issues/1630

- pricing
https://flowbite.com/blocks/marketing/pricing/

- toggle
https://flowbite.com/docs/forms/toggle/

- extending zod schemas
https://brockherion.dev/blog/posts/creating-extendable-zod-schemas-with-refine/

- react github log in
https://www.youtube.com/watch?v=rRn2EisxPl4

- react google log in
https://muhammedsahad.medium.com/react-js-a-step-by-step-guide-to-google-authentication-926d0d85edbd

- fix dialog with tooltip
https://github.com/radix-ui/primitives/discussions/933

- zod tutorials
https://www.youtube.com/watch?v=L6BE-U3oy80
https://www.youtube.com/watch?v=u6PQ5xZAv7Q

- billing component
https://v0.dev/t/CIfEf2F9ck5

- shadcn components and blocks
https://shadcn.com/
https://ui.shadcn.com/

- password input
https://gist.github.com/mjbalcueva/b21f39a8787e558d4c536bf68e267398

- double submit csrf protection
https://stackoverflow.com/questions/27067251/where-to-store-jwt-in-browser-how-to-protect-against-csrf

- roboflow sports video detection repo
https://github.com/roboflow/sports/tree/main
https://www.youtube.com/watch?v=aBVGKoNZQUw&pp=ygUdcm9ib2Zsb3cgc3VwZXJ2aXNpb24gZm9vdGJhbGw%3D

- multiporcessing write to file
https://stackoverflow.com/questions/13446445/python-multiprocessing-safely-writing-to-a-file


- initial intro to rag
https://www.youtube.com/watch?v=JLmI0GJuGlY&t=2046s&pp=ygURdGVjaCB3aXRoIHRpbSByYWc%3D
https://www.youtube.com/watch?v=ul0QsodYct4&pp=ygURdGVjaCB3aXRoIHRpbSByYWc%3D

- creating query pipeline dag, then rag from q => agentic qp
https://www.youtube.com/watch?v=T0bgevj0vto&t=851s
https://docs.llamaindex.ai/en/stable/examples/agent/agent_runner/query_pipeline_agent/


- https://python.langchain.com/v0.1/docs/use_cases/sql/csv/
⚠️ Security note ⚠️
Both approaches mentioned above carry significant risks. Using SQL requires executing model-generated SQL queries. Using a library like Pandas 
requires letting the model execute Python code. Since it is easier to tightly scope SQL connection permissions and sanitize SQL queries than it is to sandbox Python environments, 
we HIGHLY recommend interacting with CSV data via SQL. For more on general security best practices, see here.

- Adding memory to an agent
https://python.langchain.com/v0.1/docs/modules/memory/agent_with_memory/

- Asycn langchain examples
https://github.com/pinecone-io/examples/blob/master/learn/generation/langchain/handbook/09-langchain-streaming/main.py

- file upload validation
https://medium.com/@jayhawk24/upload-files-in-fastapi-with-file-validation-787bd1a57658