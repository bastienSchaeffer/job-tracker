# API Route Creator

Creates Next.js API routes with proper structure, validation, and tests.

## Description

Use this skill when the user asks to create an API route, endpoint, backend route, REST API, or API handler. Triggers on keywords: "API route", "endpoint", "backend route", "REST endpoint", "API handler", "create route", "add endpoint".

## Instructions

When creating an API route, follow these steps:

### 1. Route File Location

Create the route file at `app/api/{resource}/route.ts` (or `app/api/{resource}/[id]/route.ts` for dynamic routes).

### 2. HTTP Method Handlers

Export named functions for each HTTP method needed:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // ...
}

export async function POST(request: NextRequest) {
  // ...
}

export async function PUT(request: NextRequest) {
  // ...
}

export async function DELETE(request: NextRequest) {
  // ...
}
```

### 3. Input Validation with Zod

Always validate request bodies and query parameters:

```typescript
import { z } from "zod";

const CreateResourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // ... other fields
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = CreateResourceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const validated = result.data;
  // ... continue with validated data
}
```

### 4. Status Codes

Use appropriate HTTP status codes:

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error, bad request |
| 404 | Resource not found |
| 500 | Server error |

### 5. Response Format

Return consistent JSON responses:

```typescript
// Success
return NextResponse.json(data, { status: 200 });

// Created
return NextResponse.json(newResource, { status: 201 });

// Error
return NextResponse.json(
  { error: "Resource not found" },
  { status: 404 }
);

// No content
return new NextResponse(null, { status: 204 });
```

### 6. TypeScript Types

Define request/response types in `lib/types.ts` or co-located with the route:

```typescript
// Request body type (inferred from Zod schema)
type CreateResourceInput = z.infer<typeof CreateResourceSchema>;

// Response type
interface ResourceResponse {
  id: string;
  name: string;
  createdAt: string;
}
```

### 7. Error Handling

Wrap handlers in try-catch for unexpected errors:

```typescript
export async function GET(request: NextRequest) {
  try {
    // ... handler logic
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 8. Test File

Create a co-located test file at `__tests__/api/{resource}/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET, POST } from "@/app/api/{resource}/route";
import { NextRequest } from "next/server";

function createRequest(options: {
  method: string;
  body?: object;
  searchParams?: Record<string, string>;
}) {
  const url = new URL("http://localhost:3000/api/{resource}");
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new NextRequest(url, {
    method: options.method,
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
}

describe("/api/{resource}", () => {
  describe("GET", () => {
    it("returns resources", async () => {
      const request = createRequest({ method: "GET" });
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe("POST", () => {
    it("creates a resource with valid data", async () => {
      const request = createRequest({
        method: "POST",
        body: { name: "Test" },
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it("returns 400 for invalid data", async () => {
      const request = createRequest({
        method: "POST",
        body: {},
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
```

## Checklist

Before completing, verify:

- [ ] Route file created at correct path
- [ ] All needed HTTP methods exported
- [ ] Zod schemas for input validation
- [ ] Proper status codes returned
- [ ] TypeScript types defined
- [ ] Error handling with try-catch
- [ ] Test file created with basic coverage
