import React, { FormEvent, ReactElement } from 'react';
import _ from 'lodash';
import { ContextApi, ContextForm } from './form-context';
import { getValuesDiff } from './helpers';
import { ValidatorInterface, ValueType } from './validator';

export interface ValuesInterface {
  [key: string]: ValueType | ValuesInterface;
}

export type ValuesType = ValuesInterface | {};

export type ValidationErrorType = string[];

export interface ValidationErrorsInterface {
  [key: string]: ValidationErrorType | ValidationErrorsInterface;
}

export interface ValidationResultInterface {
  count: number;
  errors: ValidationErrorsInterface;
}

export interface ValidationRulesInterface {
  [key: string]: ValidatorInterface[] | ValidationRulesInterface;
}

export type DisabledInterface = string[];

export interface FormApiInterface<Values> {
  setTouched: (name: string, callback?: () => void) => void;
  setValue: (name: string, value: ValueType, callback?: () => void) => void;
  getValue: (name: string) => ValueType;
  removeValue: (name: string) => any;
  getErrors: (name: string) => ValidationErrorsInterface | ValidationErrorType;
  setErrors: (name: string, value: ValidationErrorType, callback?: () => void) => void;
  getErrorClass: () => string | undefined;
  getInvalidClass: () => string | undefined;
  getAllValues: () => Values;
  getAllErrors: () => ValidationErrorsInterface;
  setAllErrors: (errors: ValidationErrorsInterface, callback?: () => void) => void;
  setAllValues: (values: Values, callback?: () => void) => void;
  getAllDisabled: () => DisabledInterface;
  setDisabled: (name: string) => void;
  removeDisabled: (name: string) => void;
  isDisabled: (name: string) => boolean;
  getValuesDiff: (maxLevel?: number) => Partial<Values>;
  hasChanges: () => boolean;
  submit: () => void;
}

export interface FormProps<Values> {
  children: ((api: FormApiInterface<Values>) => ReactElement) | ReactElement | ReactElement[];
  onSubmit: (values: Values, api: FormApiInterface<Values>) => void;
  defaultValues?: Values;
  onChange?: (api: FormApiInterface<Values>) => void;
  onTouch?: (api: FormApiInterface<Values>) => void;
  onError?: (errors: ValidationErrorsInterface, api: FormApiInterface<Values>) => void;
  validation?: (api: FormApiInterface<Values>) => ValidationRulesInterface;
  errorClass?: string;
  invalidClass?: string;
  [key: string]: any;
}

export interface FormState<Values extends ValuesType = ValuesType> {
  values: Values;
  errors: ValidationErrorsInterface;
  disabled: DisabledInterface;
}

export class Form<Values extends ValuesType = ValuesType> extends React.Component<
  FormProps<Values>,
  FormState<Values>
> {
  static defaultProps = {
    defaultValues: {},
    onError: undefined,
    onChange: undefined,
    validation: undefined,
    invalidClass: 'is-invalid',
    errorClass: 'invalid-feedback',
  };

  constructor(props: any) {
    super(props);
    const { defaultValues } = props;
    this.state = {
      values: _.cloneDeep(defaultValues),
      errors: {},
      disabled: [],
    };
  }

  validateValue = (validators: ValidatorInterface[], value: ValueType): string[] => {
    const errors: string[] = [];

    validators.forEach(v => {
      const result = v(value);
      if (typeof result === 'string') {
        errors.push(result);
      }
    });

    return errors;
  };

  validateForm = (result: ValidationResultInterface, obj: ValidationRulesInterface, path: string[] = []): void => {
    Object.keys(obj).forEach(i => {
      const currentPath: string[] = [...path, i];
      const validator = obj[i];
      if (Array.isArray(validator)) {
        const value = this.api.getValue(currentPath.join('.'));
        const error = this.validateValue(validator, value);
        if (error && error.length > 0) {
          // eslint-disable-next-line no-param-reassign
          result.count += 1;
          _.set(result.errors, currentPath, error);
        }
      } else if (typeof validator === 'object' && validator !== null) {
        this.validateForm(result, validator, currentPath);
      }
    });
  };

  onSubmit = (event: FormEvent): void => {
    if (event) {
      event.preventDefault();
    }
    this.api.submit();
  };

  api: FormApiInterface<Values> = {
    setTouched: (name: string, callback?: () => void): void => {
      const { validation, onTouch } = this.props;
      const combinedCallback = () => {
        if (onTouch) {
          onTouch(this.api);
        }
        if (callback) {
          callback();
        }
      };

      if (!validation) {
        combinedCallback();
        return;
      }
      const validators = _.get(validation(this.api), name);
      if (validators && Array.isArray(validators) && validators.length > 0) {
        this.setState(({ errors, values }) => {
          const value = _.get(values, name);
          _.set(errors, name, this.validateValue(validators, value));
          return {
            errors,
            values,
          };
        }, combinedCallback);
      } else {
        combinedCallback();
      }
    },
    setValue: (name: string, value: ValueType, callback?: () => void): void => {
      const { onChange } = this.props;

      this.setState(
        ({ errors, values }) => {
          _.set(values, name, value);
          _.set(errors, name, []);
          return {
            values,
            errors,
          };
        },
        () => {
          if (onChange) {
            onChange(this.api);
          }
          if (callback) {
            callback();
          }
        },
      );
    },
    getValue: (name: string): ValueType => {
      const { values } = this.state;
      return _.get(values, name);
    },
    removeValue: (name: string): any => {
      const { values } = this.state;
      return _.omit(values, name);
    },
    getErrors: (name: string): ValidationErrorsInterface | ValidationErrorType => {
      const { errors } = this.state;
      return _.get(errors, name);
    },
    setErrors: (name: string, value: ValidationErrorType, callback?: () => void): void => {
      this.setState(({ errors }) => {
        _.set(errors, name, value);
        return {
          errors,
        };
      }, callback);
    },
    getErrorClass: (): string | undefined => {
      const { errorClass } = this.props;
      return errorClass;
    },
    getInvalidClass: (): string | undefined => {
      const { invalidClass } = this.props;
      return invalidClass;
    },
    getAllValues: (): Values => {
      const { values } = this.state;
      return values;
    },
    getAllErrors: (): ValidationErrorsInterface => {
      const { errors } = this.state;
      return errors;
    },
    setAllErrors: (errors: ValidationErrorsInterface, callback?: () => void): void => {
      this.setState(
        {
          errors,
        },
        callback,
      );
    },
    setAllValues: (values: Values, callback?: () => void): void => {
      this.setState(
        {
          values,
        },
        callback,
      );
    },
    getAllDisabled: (): DisabledInterface => {
      const { disabled } = this.state;
      return disabled;
    },
    setDisabled: (name: string): void => {
      const { disabled } = this.state;

      if (!disabled.includes(name)) {
        this.setState({ disabled: [...disabled, name] });
      }
    },
    removeDisabled: (name: string): void => {
      const { disabled } = this.state;

      if (disabled.includes(name)) {
        const index = disabled.indexOf(name);
        this.setState({ disabled: [...disabled.slice(0, index), ...disabled.slice(index + 1)] });
      }
    },
    isDisabled: (name: string): boolean => {
      const { disabled } = this.state;
      return disabled.includes(name);
    },
    getValuesDiff: (maxLevel): Partial<Values> => {
      const { defaultValues } = this.props;
      const { values } = this.state;
      return getValuesDiff(defaultValues, values, maxLevel);
    },
    hasChanges: (): boolean => !!Object.keys(this.api.getValuesDiff()).length,
    submit: (): void => {
      const { validation, onError, onSubmit } = this.props;
      const { values } = this.state;
      const result: ValidationResultInterface = {
        count: 0,
        errors: {},
      };
      if (validation) {
        this.validateForm(result, validation(this.api));
      }
      this.setState(
        {
          errors: result.errors,
        },
        () => {
          if (result.count && onError) {
            onError(result.errors, this.api);
          } else if (!result.count) {
            onSubmit(_.cloneDeep(values), this.api);
          }
        },
      );
    },
  };

  render() {
    const {
      children,
      defaultValues,
      onSubmit,
      onError,
      onChange,
      onTouch,
      validation,
      errorClass,
      invalidClass,
      ...props
    } = this.props;
    return (
      <ContextApi.Provider value={this.api}>
        <ContextForm.Provider value={this.state}>
          <form {...props} onSubmit={this.onSubmit}>
            {typeof children === 'function' ? children(this.api) : children}
          </form>
        </ContextForm.Provider>
      </ContextApi.Provider>
    );
  }
}
