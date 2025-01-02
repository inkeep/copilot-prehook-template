"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const zod_1 = require("zod");
const Attribute = zod_1.z
    .object({
    label: zod_1.z.string().describe("A short identifier or name for the attribute (e.g. 'subscription_plan')."),
    value: zod_1.z
        .string()
        .describe("The attribute's value, often a string that can be displayed or processed (e.g. 'premium')."),
    description: zod_1.z
        .string()
        .nullish()
        .describe('An optional explanation or context about how to interpret or use this attribute.'),
    useWhen: zod_1.z
        .string()
        .nullish()
        .describe("An optional condition or scenario indicating when this attribute should be considered (e.g. 'when user asks about billing')."),
})
    .describe('A structured piece of contextual data (attribute) about the user or organization.');
const CopilotSmartAssistContextHookResponse = zod_1.z
    .object({
    userAttributes: zod_1.z
        .array(Attribute)
        .nullish()
        .describe('A list of user-specific attributes providing additional context about the end-user.'),
    organizationAttributes: zod_1.z
        .array(Attribute)
        .nullish()
        .describe("A list of organization-specific attributes providing additional context about the user's organization or account."),
    prompt: zod_1.z
        .string()
        .nullish()
        .describe("Optional custom instructions or guidance to influence the copilot's response (e.g. special handling instructions, tone guidelines)."),
})
    .describe("The schema returned by the customer-owned endpoint, providing structured context and optional prompts to guide the copilot's responses.");
const MessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    createdAt: zod_1.z.date().optional(),
    content: zod_1.z.string(),
    authorId: zod_1.z.string(),
    authorType: zod_1.z.enum(['user', 'member']),
    authorName: zod_1.z.string().optional(),
    files: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        url: zod_1.z.string(),
    })),
    isInternalComment: zod_1.z.boolean().optional(),
});
const CopilotSmartAssistContextRequestSchema = zod_1.z.object({
    ticketId: zod_1.z.string(),
    ticketAttributesData: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown().refine(val => !!val, { message: 'Value must be truthy' })),
    userAttributesData: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown().refine(val => !!val, { message: 'Value must be truthy' })),
    orgAttributesData: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown().refine(val => !!val, { message: 'Value must be truthy' })),
    messages: zod_1.z.array(MessageSchema),
});
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }
    try {
        const parsedRequest = CopilotSmartAssistContextRequestSchema.safeParse(req.body);
        if (!parsedRequest.success) {
            return res.status(400).json({
                success: false,
                error: `Invalid request: ${parsedRequest.error.message}`,
            });
        }
        const { userAttributesData } = parsedRequest.data;
        const result = await fetchYourData(userAttributesData);
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
async function fetchYourData(userAttributesData) {
    // make 3rd party hook call to stripe, etc
    console.log('userAttributesData', userAttributesData);
    return {
        userAttributes: [],
        organizationAttributes: [],
        prompt: null,
    };
}
