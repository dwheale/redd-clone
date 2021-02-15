import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({field, message}) => {
    field.forEach(f => {
      errorMap[f] = message;
    })
  })

  return errorMap;
}