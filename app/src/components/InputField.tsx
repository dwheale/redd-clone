import React, { InputHTMLAttributes } from 'react';
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { useField } from 'formik';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  size:_,
  ...props
}) => {
  const [field, {error}] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name} />
      {error && (<FormErrorMessage>{error}</FormErrorMessage>)}
    </FormControl>
  );
}
