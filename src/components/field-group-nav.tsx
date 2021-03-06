import React, { useContext } from 'react';
import classNames from 'classnames';
import { ContextApi, ContextForm } from './form-context';
import { GroupInterface } from './form';

export interface FieldGroupNavProps extends Omit<React.HTMLProps<HTMLUListElement>, 'children'> {
  onClickGroup?: (group: GroupInterface) => void;
  children?: undefined;
}

const FieldGroupsComponent: React.FC<FieldGroupNavProps> = ({ onClickGroup, ...props }) => {
  const api = useContext(ContextApi);
  useContext(ContextForm);
  if (!api) {
    console.error(`Could not found Form API. Make sure <FieldGroups/> is in the <Form/>.`);
    return null;
  }
  const { errors, active, touched, completed } = api.getClasses<'fieldGroup'>('fieldGroup');
  return (
    <ul {...props}>
      {api.getGroups().map((group) => (
        <li
          key={group.name}
          className={classNames({
            [errors]: group.hasErrors,
            [active]: group.isActive,
            [touched]: group.isTouched,
            [completed]: group.isCompleted,
          })}
          onClick={() => {
            if (onClickGroup) {
              onClickGroup(group);
            }
          }}
        >
          {group.name}
        </li>
      ))}
    </ul>
  );
};

FieldGroupsComponent.displayName = 'FieldGroups';

export const FieldGroupNav = FieldGroupsComponent;
