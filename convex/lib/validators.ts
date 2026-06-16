import z from 'zod';

function generateHelpers<ZSchema extends z.ZodType>(schema: ZSchema) {
  return {
    schema,
    validator: (input: z.infer<ZSchema>) => {
      return schema.safeParse(input).success;
    },
  };
}

export const usernameSchema = generateHelpers(
  z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, 'Must only contain a-z, 0-9, -')
);

export const passwordSchema = generateHelpers(z.string().min(6));

export const userPassSchema = generateHelpers(
  z.object({
    username: usernameSchema.schema,
    password: passwordSchema.schema,
  })
);
