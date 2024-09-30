import { useEffect } from 'react';

const useSetTitle = (title: string, withBase: boolean = true) => {
    useEffect(() => {
        document.title = withBase ? 'StatRoom - ' + title : title;
    }, [title, withBase]);
};

export default useSetTitle;
