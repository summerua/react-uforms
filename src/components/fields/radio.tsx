import React from 'react';
import Field, { FieldPassedProps } from '../field';
import { valueToJson } from '../helpers';

export interface RadioProps {
  value?: string | number | boolean | {} | null;
  onChange?: (event: React.ChangeEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

const Radio: React.FC<RadioProps & FieldPassedProps> = ({
  getValue,
  setValue,
  setTouched,
  onBlur,
  onChange,
  value,
  ...props
}) => (
  <input
    {...props}
    value={valueToJson(getValue())}
    checked={value === getValue()}
    type="radio"
    onChange={event => {
      event.persist();
      setValue(value, () => {
        if (onChange) {
          onChange(event);
        }
      });
    }}
    onBlur={event => {
      event.persist();
      setTouched(() => {
        if (onBlur) {
          onBlur(event);
        }
      });
    }}
  />
);

export default Field(Radio, { hideError: true });