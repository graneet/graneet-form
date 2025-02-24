import type { Dispatch, ReactNode, SetStateAction } from 'react';

export type PlaceholderContent = Record<string, ReactNode>;
export type PlaceholderContentSetter = Dispatch<SetStateAction<PlaceholderContent>>;
