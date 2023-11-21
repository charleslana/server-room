import { celebrate, Joi, Segments } from 'celebrate';

export const idParamMiddleware = () => {
  return celebrate(
    {
      [Segments.PARAMS]: {
        id: Joi.number().required(),
      },
    },
    { abortEarly: false }
  );
};
