import { Button } from '@/components/ui/button';
import setTitle from '@/components/hooks/set-title';
import {
    DiscordLogoIcon,
    GitHubLogoIcon,
} from '@radix-ui/react-icons';
import { Separator } from '@radix-ui/react-separator';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Copy, Eye, EyeOff } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { CodeBlock } from 'react-code-blocks';
import { useToast } from '@/components/hooks/use-toast';
import { SlackIcon } from '@/components/Icons';

function Integrations() {
    setTitle('Integrations');
    const [isShowingAPIKey, setIsShowingAPIKey] = useState(false);

    useEffect(() => {
        setIsShowingAPIKey(false);
    }, []);

    const { toast } = useToast();
    return (
        <div className="grid gap-6">
            <h3 className="text-lg font-semibold">
                Connect to your favourite services, api, or use our SDK
            </h3>
            <Card>
                <CardHeader>
                    <CardTitle className="font-bold text-xl">
                        Services
                    </CardTitle>
                    <CardDescription>
                        Connecting your StatRoom account to your favourite
                        services to make your workflow more efficient.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex justify-between ">
                        <div className="mr-12">
                            <span className="font-semibold">Github</span>
                            <p className="text-sm text-slate-500">
                                Connect your Github account to StatRoom. Train
                                your models and push your data and analysis to
                                your repositories.
                            </p>
                        </div>
                        <Button variant={'outline'} className="my-auto">
                            <GitHubLogoIcon className="h-4 w-4 mr-2" />
                            Connect
                        </Button>
                    </div>
                    <Separator orientation="horizontal" className="w-full" />

                    <div className="flex justify-between ">
                        <div className="mr-12">
                            <span className="font-semibold">Discord</span>
                            <p className="text-sm text-slate-500">
                                Connect your Discord account to StatRoom to
                                integrate your data and analysis with your
                                Discord server on private and public channels.
                            </p>
                        </div>
                        <Button variant={'outline'} className="my-auto">
                            <DiscordLogoIcon className="h-4 w-4 mr-2" />
                            Connect
                        </Button>
                    </div>
                    <Separator orientation="horizontal" className="w-full" />

                    <div className="flex justify-between ">
                        <div className="mr-12">
                            <span className="font-semibold">Slack</span>
                            <p className="text-sm text-slate-500">
                                Connect your Slack account to StatRoom to
                                integrate with your workspace and channels.
                            </p>
                        </div>
                        <Button variant={'outline'} className="my-auto">
                            
                            <SlackIcon className="h-4 w-4 mr-2" />
                            Connect
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle id="api" className="font-bold text-xl">
                        API
                    </CardTitle>
                    <CardDescription>
                        Use our API to integrate StatRoom with your application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <span className="font-semibold">API Key</span>
                    <Dialog
                        onOpenChange={(open) => {
                            if (!open) {
                                setIsShowingAPIKey(false);
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline">Get your api key</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Your API Key</DialogTitle>
                                <DialogDescription>
                                    Keep your API key secret and do not share
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor="link" className="sr-only">
                                        Link
                                    </Label>
                                    <Input
                                        id="link"
                                        value={
                                            isShowingAPIKey
                                                ? 'hXycaskd'
                                                : '****************'
                                        }
                                        readOnly
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="sm"
                                    className="px-3"
                                    onClick={() =>
                                        setIsShowingAPIKey(!isShowingAPIKey)
                                    }
                                >
                                    <span className="sr-only">
                                        Show API Key
                                    </span>
                                    {isShowingAPIKey ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <EyeOff className="h-4 w-4" />
                                    )}
                                </Button>

                                <Button
                                    type="submit"
                                    size="sm"
                                    className="px-3"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            'hXycaskd'
                                        );
                                        toast({
                                            title: 'API Key copied',
                                            variant: 'default',
                                        });
                                    }}
                                >
                                    <span className="sr-only">Copy</span>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <DialogFooter className="sm:justify-start">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Close
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <h3 className="font-semibold">Endpoints</h3>
                    <span className="text-sm text-slate-500">
                        Use the following endpoints to get data from StatRoom
                    </span>
                    <span className="font-semibold">
                        Base URL:{' '}
                        <span className="underline">
                            https://api.statroom.com/api/v1
                        </span>
                    </span>
                    <div className="grid gap-8">
                        <div className="flex items-center space-x-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <span className="text-sm text-black font-semibold">
                                                GET
                                            </span>{' '}
                                            <span className="text-sm text-slate-500">
                                                /sports
                                            </span>
                                        </TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>Get all sports</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>
                                            Get games of a specific sport
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>
                                            <span className="text-sm  text-black font-semibold">
                                                GET
                                            </span>{' '}
                                            <span className="text-sm text-slate-500">
                                                /teams
                                            </span>
                                        </TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>Get all teams</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>
                                            Get data of a specific team
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableHead>
                                            {' '}
                                            <span className="text-sm text-black font-semibold">
                                                GET
                                            </span>{' '}
                                            <span className="text-sm text-slate-500">
                                                /players
                                            </span>
                                        </TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>Get all sports</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>
                                            Get games of a specific sport
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableHead>
                                            <span className="text-sm text-black font-semibold">
                                                GET
                                            </span>{' '}
                                            <span className="text-sm text-slate-500">
                                                /events
                                            </span>
                                        </TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>
                                            Get all events for a match
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {/* <div className="flex items-center space-x-2">
                            
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <span className="text-sm  text-black font-semibold">GET</span>{" "}
                                            <span className="text-sm text-slate-500">
                                                /games
                                            </span></TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                           
                                        </TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>Get all teams</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>
                                            Get data of a specific team
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div> */}

                        {/* <div className="flex items-center space-x-2">
                           
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead> <span className="text-sm text-black font-semibold">GET</span> {" "}
                            <span className="text-sm text-slate-500">
                                /players
                            </span></TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>Get all sports</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>
                                            Get games of a specific sport
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div> */}

                        {/* <div className="flex items-center space-x-2">
                            
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <span className="text-sm text-black font-semibold">GET</span>{" "}
                                            <span className="text-sm text-slate-500">
                                                /events
                                            </span></TableHead>
                                        <TableHead>Params</TableHead>
                                        <TableHead>Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            
                                        </TableCell>
                                        <TableCell>id</TableCell>
                                        <TableCell>Get all events for a match</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div> */}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-bold text-xl">SDKs</CardTitle>
                    <CardDescription>
                        Use our SDKs to integrate StatRoom direclty with your
                        application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <h3 className="font-bold text-xl">Python</h3>
                        <p className="font-semibold">Step 1: Install the SDK</p>

                        <div className="my-2">
                            <p>Use pip to install the StatRoom Python SDK.</p>
                            <CodeBlock
                                text="pip install statroom"
                                language="bash"
                                showLineNumbers={false}
                            />
                        </div>

                        <p className="font-semibold">
                            Step 2: Initiazlie the SDK
                        </p>
                        <div className="my-2">
                            <p>
                                Set up the SDK by importing it and providing
                                your API key.
                            </p>
                            <CodeBlock
                                text={`from statroom_sdk import StatRoom\n\n# Replace 'your_api_key_here' with your actual API key\napi_key = "your_api_key_here"\n\n# Initialize the SDK\nstatroom = StatRoom(api_key)`}
                                showLineNumbers={false}
                                language="python"
                            />
                        </div>

                        <p className="font-semibold">
                            Step 3: Retrieving stats
                        </p>
                        <div className="my-2">
                            <p>
                                Use the SDK to fetch statistics (e.g for a
                                specific player) and use them in your
                                application.
                            </p>

                            <CodeBlock
                                text={`# Get all sports
sports = statroom.get_sports()\n\n# Get all games
games = statroom.get_games()\n\n# Get all players
players = statroom.get_players()\n\n# Get all teams
teams = statroom.get_teams()\n\n# Get all events
events = statroom.get_events()\n\n# Get all stats

# Replace 12345 with the actual player ID
player_id = 12345
player_stats = statroom.get_player_stats(player_id)

print("Player Statistics:")
print(f"Name: {player_stats['name']}")
print(f"Distance Covered: {player_stats['distance_covered']} meters")
print(f"Pass Accuracy: {player_stats['pass_accuracy']}%")
print(f"Tackles: {player_stats['tackles']}")
print(f"Possession: {player_stats['possession']}%")
print(f"Goals: {player_stats['goals']}")
`}
                                showLineNumbers={false}
                                language="python"
                            />
                        </div>

                        <p className="font-semibold">
                            Step 4: Implement Real-Time Event Tracking
                        </p>
                        <div className="my-2">
                            <p>Track live match events and process them.</p>
                            <CodeBlock
                                text={`# Replace 12345 with the actual game ID\nmatch_id = 12345\n\n# Track match events\nevents = statroom.track_match_events(match_id)\n\nfor event in events:\n    print(f"Event: {event['type']}, Player: {event['player_name']}, Timestamp: {event['timestamp']}")`}
                                showLineNumbers={false}
                                language="python"
                            />
                        </div>
                    </div>

                    <div>
                        <Separator
                            orientation="horizontal"
                            className="w-96 h-12"
                        />

                        <h3 className="font-bold text-xl">Node.js</h3>
                        <p className="font-semibold">Step 1: Install the SDK</p>
                        <div className="my-2">
                            <p>Use npm to install the StatRoom Node SDK.</p>
                            <CodeBlock
                                text="npm install statroom"
                                language="bash"
                                showLineNumbers={false}
                            />
                        </div>

                        <p className="font-semibold">
                            Step 2: Initiazlie the SDK
                        </p>

                        <div className="my-2">
                            <p>
                                Set up the SDK by importing it and providing
                                your API key.
                            </p>
                            <CodeBlock
                                text={`const StatRoom = require('statroom');\n\n// Replace 'your_api_key_here' with your actual API key\nconst apiKey = 'your_api_key_here';\n\n// Initialize the SDK\nconst statroom = new StatRoom(apiKey);`}
                                showLineNumbers={false}
                                language="javascript"
                            />
                        </div>

                        <p className="font-semibold">
                            Step 3: Retrieving stats
                        </p>

                        <div className="my-2">
                            <p>
                                Use the SDK to fetch statistics (e.g for a
                                specific player) and use them in your
                                application.
                            </p>

                            <CodeBlock
                                text={`// Get all sports
const sports = statroom.getSports();\n\n// Get all games
const games = statroom.getGames();\n\n// Get all players
const players = statroom.getPlayers();\n\n// Get all teams
const teams = statroom.getTeams();\n\n// Get all events
const events = statroom.getEvents();\n\n// Get all stats\n\n// Replace 12345 with the actual player ID
const playerId = 12345;\nconst playerStats = statroom.getPlayerStats(playerId);\n\nconsole.log('Player Statistics:');\nconsole.log('Name:', playerStats.name);\nconsole.log('Distance Covered:', playerStats.distance_covered, 'meters');\nconsole.log('Pass Accuracy:', playerStats.pass_accuracy, '%');\nconsole.log('Tackles:', playerStats.tackles);\nconsole.log('Possession:', playerStats.possession, '%');\nconsole.log('Goals:', playerStats.goals);`}
                                showLineNumbers={false}
                                language="javascript"
                            />
                        </div>

                        <p className="font-semibold">
                            Step 4: Implement Real-Time Event Tracking
                        </p>

                        <div className="my-2">
                            <p>Track live match events and process them.</p>

                            <p>Track live match events and process them.</p>
                            <CodeBlock
                                text={`// Replace 12345 with the actual game ID
const matchId = 12345;\n\n// Track match events\nconst events = statroom.trackMatchEvents(matchId);\n\nevents.forEach(event => {\n    console.log('Event:', event.type, 'Player:', event.player_name, 'Timestamp:', event.timestamp);\n});`}
                                showLineNumbers={false}
                                language="javascript"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Integrations;
