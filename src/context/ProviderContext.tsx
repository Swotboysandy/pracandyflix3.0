import React, { createContext, useState, useContext, ReactNode } from 'react';

type Provider = 'Netflix' | 'Prime';

interface ProviderContextType {
    provider: Provider;
    setProvider: (provider: Provider) => void;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export const ProviderProvider = ({ children }: { children: ReactNode }) => {
    const [provider, setProvider] = useState<Provider>('Netflix');

    return (
        <ProviderContext.Provider value={{ provider, setProvider }}>
            {children}
        </ProviderContext.Provider>
    );
};

export const useProvider = () => {
    const context = useContext(ProviderContext);
    if (!context) {
        throw new Error('useProvider must be used within a ProviderProvider');
    }
    return context;
};
