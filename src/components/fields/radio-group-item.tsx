import React from 'react';
import { ContextRadioGroup } from '../form-context';
import { valueToJson } from '../helpers';

export interface RadioGroupItemProps extends Omit<React.HTMLProps<HTMLInputElement>, 'value'> {
  value: string | number | boolean | {} | null;
}

const RadioGroupItemComponent: React.FC<RadioGroupItemProps> = ({ value, onBlur, ...props }) => (
  <ContextRadioGroup.Consumer>
    {(radioApi) => {
      if (!radioApi) {
        console.error('Could not found Radio Group API. Make sure <RadioGroupItem/> is in the <RadioGroup/>.');
        return null;
      }
      const { name, getValue, setTouched, onChange } = radioApi;
      return (
        <input
          {...props}
          name={name}
          value={valueToJson(value)}
          checked={value === getValue()}
          type="radio"
          onChange={onChange}
          onBlur={(event) => {
            event.persist();
            setTouched(() => {
              if (onBlur) {
                onBlur(event);
              }
            });
          }}
        />
      );
    }}
  </ContextRadioGroup.Consumer>
);

RadioGroupItemComponent.displayName = 'RadioGroupItem';

export const RadioGroupItem = RadioGroupItemComponent;
