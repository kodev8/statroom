import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

type SearchResultProps = {
    text: string
    image?: string
    isLast: boolean
    to: string
    }
const SearchResult = ({text, image, isLast, to}: SearchResultProps) => {
  return (
      <Link to={to}
          className={cn('flex items-center justify-between border-b border-gray-200 py-2 px-2 w-full bg-white hover:bg-gray-100 text-black dark:bg-black dark:text-white', {
                'border-b-0 rounded-b-md': isLast
            })}
      >
            <div className="flex items-center">
              <img src={image ?? '/statroom-icon.png' } alt="" className="w-8 h-8 rounded-full"/>
              <p className="ml-4 text-sm">{text}</p>
          </div>
      </Link>
  )
}

export default SearchResult