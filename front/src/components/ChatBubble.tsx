import { cn } from '@/lib/utils';


type TChatBubbleProps = {
    isUser: boolean;
    message: string;
    sender: string;
};

const ChatBubble = ({
    isUser = true,
    message,
    sender,
}: TChatBubbleProps) => {
    return (
        <div
            {...(isUser ? { dir: 'rtl' } : { dir: 'ltr' })}
            className={cn('flex items-start row-revergap-2.5 max-w-[45%]', {
                'justify-self-end': isUser,
                'justify-self-start': !isUser,
            })}
        >
            {/* <img
                className="w-8 h-8 rounded-full"
                src="/placeholder.jpeg"
            /> */}

            <div className="flex flex-col gap-1 my-1">
                <div
                    className={cn(
                        'flex flex-col w-full leading-1.5 p-4 border-gray-200  rounded-e-xl rounded-es-xl dark:bg-gray-700',
                        {
                            'border-r-2 border-gray-200 dark:border-gray-700 bg-blue-100':
                                isUser,
                            'border-l-2 border-gray-200 dark:border-gray-700 bg-gray-100':
                                !isUser && sender === 'system',
                            'border-l-2 border-gray-200 dark:border-gray-700 bg-green-100':
                                !isUser && sender !== 'system',
                        }
                    )}
                >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {sender === 'system' ? 'StatRoomAI' : sender}
                        </span>
                        {/* <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {time}
                        </span> */}
                    </div>
                    <p className={cn("text-sm font-normal text-gray-900 dark:text-white", 
                        {
                            "text-right": isUser,
                            "text-left": !isUser
                        }
                    )} dir="ltr">
                        {message}
                    </p>
              

                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        Delivered
                    </span>
                </div>
            </div>
            {/* <button
                id="dropdownMenuIconButton"
                data-dropdown-toggle="dropdownDots"
                data-dropdown-placement="bottom-start"
                className="inline-flex self-center items-center p-2 mx-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
                type="button"
            >
                <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 4 15"
                >
                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                </svg>
            </button> */}
            <div
                id="dropdownDots"
                className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-40 dark:bg-gray-700 dark:divide-gray-600"
            >
                <ul
                    className="py-2 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownMenuIconButton"
                >
                    <li>
                        <a
                            href="/"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            Reply
                        </a>
                    </li>
                    <li>
                        <a
                            href="/"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            Forward
                        </a>
                    </li>
                    <li>
                        <a
                            href="/"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            Copy
                        </a>
                    </li>
                    <li>
                        <a
                            href="/"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            Report
                        </a>
                    </li>
                    <li>
                        <a
                            href="/"
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            Delete
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ChatBubble;
