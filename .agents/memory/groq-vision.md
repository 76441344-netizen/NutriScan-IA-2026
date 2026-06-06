---
name: Groq vision model
description: Which Groq model to use for image analysis in NutriScan IA
---

Use `meta-llama/llama-4-scout-17b-16e-instruct` for vision/image tasks via Groq SDK.

**Why:** It's the only vision-capable model returned by `groq.models.list()` on this account. Other common names like `llava-v1.5-7b-4096-preview` are not available.

**How to apply:** When sending image content to Groq, use the `image_url` content type with a `data:<mimeType>;base64,<base64>` URL. Send image + text prompt in the same message array.
