import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, Resolver } from "react-hook-form";
import { z, ZodTypeAny } from "zod";

export function typedZodResolver<
  TSchema extends ZodTypeAny,
  TOutput extends FieldValues = z.infer<TSchema> & FieldValues
>(schema: TSchema): Resolver<TOutput, any, TOutput> {
  return zodResolver(schema as any) as Resolver<TOutput, any, TOutput>;
}
