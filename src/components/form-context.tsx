import { createContext } from 'react';
import { FormApiInterface, FormState } from './form';
import { RadioGroupApi } from './fields/radio-group';

export const ContextApi = createContext<FormApiInterface<any> | undefined>(undefined);
export const ContextForm = createContext<FormState | undefined>(undefined);
export const ContextRadioGroup = createContext<RadioGroupApi | undefined>(undefined);
