import { useContext, createContext, useState, useMemo } from 'react';

type TCrumbContext = {
    crumbLabel: string;
    setCrumbLabel: (label: string) => void;
    redirect: string;
    setRedirect: (path: string) => void;
};

const CrumbContext = createContext<TCrumbContext | null>(null);

const CrumbProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [crumbLabel, setCrumbLabel] = useState('');
    const [redirect, setRedirect] = useState('');
    const value = useMemo(() => ({ redirect, setRedirect, crumbLabel, setCrumbLabel }), [redirect, crumbLabel]);

    return (
        <CrumbContext.Provider value={value}>
            {children}
        </CrumbContext.Provider>
    );
};

export const useCrumb = () => {
    const context = useContext(CrumbContext);
    if (!context) {
        throw new Error('useCrumb must be used within a CrumbProvider');
    }
    return context;
};

export default CrumbProvider;
