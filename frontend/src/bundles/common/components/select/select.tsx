import {
    type Control,
    type FieldErrors,
    type FieldPath,
    type FieldValues
} from 'react-hook-form';
import { type GroupBase, type Props } from 'react-select';
import ReactSelect from 'react-select';
import makeAnimated from 'react-select/animated';

import { useCallback, useFormController } from '~/bundles/common/hooks/hooks.js';

import { getStyles } from './libs/styles/styles.js';
import { type SelectOption, type ValueSelectTypes } from './libs/types/types.js';

type Properties<
    T extends FieldValues,
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectOption> = GroupBase<SelectOption>,
> = Props<SelectOption, IsMulti, Group> & {
    name: FieldPath<T>;
    control: Control<T, null>;
    errors: FieldErrors<T>;
    label?: string;
};

const animatedComponents = makeAnimated();

const Select = <
    T extends FieldValues,
    IsMulti extends boolean = false,
    Group extends GroupBase<SelectOption> = GroupBase<SelectOption>,
>({
    name,
    styles,
    control,
    errors,
    options,
    placeholder = '',
    label = '',
    isMulti,
    isDisabled = false,
    isClearable = false,
    ...rest
}: Properties<T, IsMulti, Group>): JSX.Element => {
    const { field } = useFormController({ name, control });
    const error = errors[name]?.message as string;

    const handleSelectValue = (
        value: ValueSelectTypes | ValueSelectTypes[]
    ): SelectOption | SelectOption[] | undefined => {
        return (isMulti && value) ?
            (options as SelectOption[]).filter(selectedOption =>
                (value as ValueSelectTypes[]).includes(selectedOption.value))
            : (options as SelectOption[]).find(option => option.value === value);
    };

    const handleChange = useCallback(
        (selectedOptions: unknown): void => {
            const optionsToUpdate = isMulti ?
                (selectedOptions as SelectOption[]).filter(selectedOption =>
                    (options as SelectOption[]).some(option => option.value === selectedOption.value))
                    .map(selectedOption => selectedOption.value)
                : (selectedOptions as SelectOption).value;

            field.onChange(optionsToUpdate);
        },
        [isMulti, field, options]
    );

    return (
        <div className='mx-20 p-5 bg-lm-black-200 '>
            {label &&
                <span
                    className='text-base font-medium text-lm-white'>
                    {label}
                </span>
            }
            <ReactSelect
                {...rest}
                name={name}
                placeholder={placeholder}
                options={options}
                isMulti={isMulti}
                isDisabled={isDisabled}
                isClearable={isClearable}
                components={animatedComponents}
                value={handleSelectValue(field.value) ?? null}
                onChange={handleChange}
                styles={{ ...getStyles<IsMulti, Group>(), ...styles }}
            />
            <span className={'error'}>{error}</span>
        </div>

    );
};

export { Select };
