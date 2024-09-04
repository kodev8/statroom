import { SafeParseSuccess, ZodSchema } from 'zod';
import { Request, Response } from 'express';
import statusCodes from '~/constants/statusCodes';

// Create a discriminated union type for the return value
type ParseZodResult<T> =
    | { success: true; data: SafeParseSuccess<T>['data'] }
    | { success: false; response: Response };

export function parseZodBody<T>(
    schema: ZodSchema<T>,
    req: Request,
    res: Response
): ParseZodResult<T> {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const zodErrors: Record<string, string> = {};

        result.error.issues.forEach((issue) => {
            zodErrors[issue.path[0].toString()] = issue.message;
        });

        return {
            success: false,
            response: res
                .status(statusCodes.badRequest)
                .json({ message: zodErrors }),
        };
    }

    return {
        success: true,
        data: result.data,
    };
}
