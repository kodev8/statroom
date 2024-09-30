import { Input } from '@/components/ui/input';
import SearchResult from '@/components/SearchResult';
import { EllipsisIcon, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/constants/axios';
import { useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import baseRoutes from '@/constants/routes';


type TSearchResult =  { 
    id: number;
    name: string;
    thumbnail?: string;
    picture?: string;
}

const parseProjectSearch = (searchString: string) => {
    const parts = searchString.split(/(#[^\s#]+)/g);
    
    let projectName = '';
    const tags: string[] = [];
    
    parts.forEach(part => {
      if (part.startsWith('#')) {
        tags.push(part.slice(1));
      } else {
        const trimmedPart = part.trim();
        if (trimmedPart) {
          if (projectName) {
            projectName += ' ';
          }
          projectName += trimmedPart;
        }
      }
    });
  
    const params = new URLSearchParams();
    
    if (projectName) {
      params.set('name', projectName.trim());
    }
    
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    }
    
    return params.toString();
};
  
const renderSearchResults = (search: string, data: TSearchResult[], searchBy: string) => {
    if (search.length === 0) {
        return null;
    }

    if (search.length > 0 && data?.length === 0) {
        return <p className='p-4 text-center text-gray-500 dark:text-gray-400'>No results found</p>;
    }

    if (search.length > 0 && data?.length > 0) {
        return data.map((item: TSearchResult, index: number) => {
            const image = searchBy === 'project' ? item.thumbnail : item.picture;
            return (
                <SearchResult 
                    text={item.name} 
                    image={image} 
                    key={item.id} 
                    isLast={index === data.length - 1}
                    to={searchBy === 'project' ? `${baseRoutes.projects}/${item.id}` : `${baseRoutes.teams}/${item.id}`}
                />
            );
        });
    }

    return null;
};

const SearchBar = () => {

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 1000);
    const { data } = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: async (): Promise<TSearchResult[]> => {
            if (searchBy === 'project') {
                const search = parseProjectSearch(debouncedSearch);
                const { data } = await axiosInstance.get(`/projects?limit=6&${search}`);
                const projectData = [
                    ...data.projects
                ]
                return projectData;
            } else if(searchBy === 'team') {
                const { data } = await axiosInstance.get(`/teams?limit=4&name=${search}`);
                const teamData = [
                    ...data.myTeams,
                    ...data.otherTeams,
                ]
                return teamData;
            } else { 
                return [];
            }

        },
        enabled: debouncedSearch.length > 1,
    });

  const [searchBy, setSearchBy] = useState("project");

    

    return (
      
      <div className="relative ml-auto flex-1 md:grow-0">
          
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          
        <Input
                type="search"
                value={search}
                    onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />



        <DropdownMenu >
            <DropdownMenuTrigger asChild className="absolute right-[100%] top-0 bg-transparent">
                <Button variant="ghost"><EllipsisIcon/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Search by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={searchBy} onValueChange={setSearchBy}>
                <DropdownMenuRadioItem value="project">Projects</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="team">Teams</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
            </DropdownMenu>


            <div className={cn('absolute top-[105%] z-[99] w-full border border-gray-200 bg-white dark:bg-black dark:border-gray-800 rounded-md shadow-lg',
                { hidden: search.length === 0 || !data }
            )}>
                {renderSearchResults(debouncedSearch, (data as TSearchResult[]), searchBy)}
        </div>
</div>
)
}

export default SearchBar