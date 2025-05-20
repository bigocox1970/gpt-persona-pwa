| table_name       | column_name     | data_type                | is_nullable | column_default               |
| ---------------- | --------------- | ------------------------ | ----------- | ---------------------------- |
| api_calls        | id              | uuid                     | NO          | gen_random_uuid()            |
| api_calls        | user_id         | uuid                     | YES         | null                         |
| api_calls        | endpoint        | text                     | NO          | null                         |
| api_calls        | request_payload | jsonb                    | YES         | null                         |
| api_calls        | response_status | integer                  | YES         | null                         |
| api_calls        | created_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| chat_sessions    | id              | uuid                     | NO          | gen_random_uuid()            |
| chat_sessions    | user_id         | uuid                     | NO          | null                         |
| chat_sessions    | persona_id      | uuid                     | NO          | null                         |
| chat_sessions    | created_at      | timestamp with time zone | YES         | now()                        |
| chat_sessions    | last_message_at | timestamp with time zone | YES         | now()                        |
| chats            | id              | uuid                     | NO          | uuid_generate_v4()           |
| chats            | user_id         | uuid                     | YES         | null                         |
| chats            | persona_id      | uuid                     | YES         | null                         |
| chats            | created_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| highlights       | id              | uuid                     | NO          | uuid_generate_v4()           |
| highlights       | chat_id         | uuid                     | YES         | null                         |
| highlights       | message_id      | uuid                     | YES         | null                         |
| highlights       | note            | text                     | YES         | null                         |
| highlights       | created_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| messages         | id              | uuid                     | NO          | uuid_generate_v4()           |
| messages         | chat_id         | uuid                     | YES         | null                         |
| messages         | sender          | text                     | NO          | null                         |
| messages         | content         | text                     | NO          | null                         |
| messages         | created_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| notes            | id              | uuid                     | NO          | gen_random_uuid()            |
| notes            | user_id         | uuid                     | NO          | null                         |
| notes            | chat_id         | uuid                     | YES         | null                         |
| notes            | message_id      | uuid                     | YES         | null                         |
| notes            | content         | text                     | NO          | null                         |
| notes            | created_at      | timestamp with time zone | YES         | now()                        |
| notes            | updated_at      | timestamp with time zone | YES         | now()                        |
| notes            | title           | text                     | YES         | null                         |
| personas         | id              | uuid                     | NO          | uuid_generate_v4()           |
| personas         | name            | text                     | NO          | null                         |
| personas         | description     | text                     | YES         | null                         |
| personas         | image_url       | text                     | YES         | null                         |
| personas         | created_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| personas         | base_prompt     | text                     | NO          | ''::text                     |
| personas         | updated_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| profiles         | id              | uuid                     | NO          | null                         |
| profiles         | username        | text                     | YES         | null                         |
| profiles         | avatar_url      | text                     | YES         | null                         |
| profiles         | updated_at      | timestamp with time zone | YES         | now()                        |
| profiles         | is_admin        | boolean                  | YES         | false                        |
| sub_prompts      | id              | uuid                     | NO          | gen_random_uuid()            |
| sub_prompts      | persona_id      | uuid                     | YES         | null                         |
| sub_prompts      | keyword         | text                     | NO          | null                         |
| sub_prompts      | prompt          | text                     | NO          | null                         |
| sub_prompts      | created_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| todos            | id              | uuid                     | NO          | gen_random_uuid()            |
| todos            | user_id         | uuid                     | NO          | null                         |
| todos            | title           | text                     | NO          | null                         |
| todos            | description     | text                     | YES         | null                         |
| todos            | status          | text                     | NO          | 'pending'::text              |
| todos            | due_date        | timestamp with time zone | YES         | null                         |
| todos            | created_at      | timestamp with time zone | YES         | now()                        |
| todos            | updated_at      | timestamp with time zone | YES         | now()                        |
| todos            | chat_id         | uuid                     | YES         | null                         |
| user_preferences | user_id         | uuid                     | NO          | null                         |
| user_preferences | preferences     | jsonb                    | YES         | null                         |
| user_preferences | updated_at      | timestamp with time zone | YES         | timezone('utc'::text, now()) |




[
  {
    "table_name": "api_calls",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "api_calls",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_calls",
    "column_name": "endpoint",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "api_calls",
    "column_name": "request_payload",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_calls",
    "column_name": "response_status",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "api_calls",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "chat_sessions",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "chat_sessions",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "chat_sessions",
    "column_name": "persona_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "chat_sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "chat_sessions",
    "column_name": "last_message_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "chats",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "chats",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "chats",
    "column_name": "persona_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "chats",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "highlights",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "highlights",
    "column_name": "chat_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "highlights",
    "column_name": "message_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "highlights",
    "column_name": "note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "highlights",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "messages",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "messages",
    "column_name": "chat_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "messages",
    "column_name": "sender",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "messages",
    "column_name": "content",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "messages",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "notes",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "notes",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "notes",
    "column_name": "chat_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "notes",
    "column_name": "message_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "notes",
    "column_name": "content",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "notes",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "notes",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "notes",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "personas",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "table_name": "personas",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "personas",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "personas",
    "column_name": "image_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "personas",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "personas",
    "column_name": "base_prompt",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "''::text"
  },
  {
    "table_name": "personas",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "profiles",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "username",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "avatar_url",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "profiles",
    "column_name": "is_admin",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "sub_prompts",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "sub_prompts",
    "column_name": "persona_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "sub_prompts",
    "column_name": "keyword",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "sub_prompts",
    "column_name": "prompt",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "sub_prompts",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  },
  {
    "table_name": "todos",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "todos",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "todos",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "todos",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "todos",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'pending'::text"
  },
  {
    "table_name": "todos",
    "column_name": "due_date",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "todos",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "todos",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "todos",
    "column_name": "chat_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "user_preferences",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "user_preferences",
    "column_name": "preferences",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "user_preferences",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "timezone('utc'::text, now())"
  }
]

---

## personas Table Schema (Reference)

| Column Name   | Data Type                | Required | Default/Notes                |
|--------------|-------------------------|----------|------------------------------|
| id           | uuid                    | YES      | uuid_generate_v4()           |
| name         | text                    | YES      |                              |
| description  | text                    | NO       |                              |
| image_url    | text                    | NO       |                              |
| created_at   | timestamp with time zone| NO       | timezone('utc'::text, now()) |
| base_prompt  | text                    | YES      | ''::text                     |
| updated_at   | timestamp with time zone| NO       | timezone('utc'::text, now()) |

### Example: Insert GPT Classic Persona

```sql
INSERT INTO personas (id, name, description, image_url, base_prompt)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'GPT Classic (no persona)',
  'A classic, neutral AI assistant. No special persona, no extra context—just helpful and friendly.',
  '/images/gpt-classic-card.png',
  'You are a helpful AI assistant.'
);
```