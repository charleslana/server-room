import { celebrate, Joi, Segments } from 'celebrate';

export const userCreateMiddleware = () => {
  return celebrate(
    {
      [Segments.BODY]: {
        username: Joi.string()
          .pattern(/^[a-zA-ZÀ-ú0-9]*$/)
          .trim()
          .min(3)
          .max(15)
          .required()
          .messages({
            'string.pattern.base':
              'o campo {{#label}} com o valor {:[.]} deve conter apenas letras e números',
            'string.min':
              'O tamanho do texto de {{#label}} deve ter pelo menos {{#limit}} caracteres',
            'string.max':
              '{{#label}} tamanho do texto deve ser menor ou igual a {{#limit}} caracteres',
            'any.required': 'O campo {{#label}} é obrigatório',
            'string.empty': 'O campo {{#label}} não pode estar vazio',
          }),
        password: Joi.string().required().min(6).max(50).messages({
          'string.base': 'O campo {{#label}} deve ser uma string válida',
          'string.min': 'O campo {{#label}} deve ter pelo menos {#limit} caracteres',
          'string.max': 'O campo {{#label}} não deve ter mais de {#limit} caracteres',
          'any.required': 'O campo {{#label}} é obrigatório',
        }),
        passwordConfirmation: Joi.string()
          .valid(Joi.ref('password'))
          .when('password', {
            is: Joi.exist(),
            then: Joi.required(),
          })
          .messages({
            'any.only': 'O campo {{#label}} deve ser igual à senha',
            'any.required': 'O campo {{#label}} é obrigatória quando a senha é fornecida',
          }),
      },
    },
    { abortEarly: false }
  );
};

export const userAuthMiddleware = () => {
  return celebrate(
    {
      [Segments.BODY]: {
        username: Joi.string().trim().required().messages({
          'any.required': 'O campo {{#label}} é obrigatório',
          'string.empty': 'O campo {{#label}} não pode estar vazio',
        }),
        password: Joi.string().required().messages({
          'any.required': 'O campo {{#label}} é obrigatório',
          'string.empty': 'O campo {{#label}} não pode estar vazio',
        }),
      },
    },
    { abortEarly: false }
  );
};
