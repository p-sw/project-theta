import { readFile, writeFile } from 'fs/promises';

/**
 * @typedef {import('./swagger.d.ts').IOpenAPI} IOpenAPI
 */

/**
 * @typedef {import('./swagger.d.ts').ISchema} ISchema
 */

const swagger_path = './api/swagger.json';

/** @type {ISchema} */
const invalid_session_schema = {
  type: 'object',
  properties: {
    code: {
      const: 'invalid_session',
    },
    error: {
      type: 'object',
      properties: {
        session: {
          type: 'string',
        },
      },
      required: [],
    },
  },
  required: ['code', 'error'],
};
/**
 * @param {string} path
 * @returns {Promise<IOpenAPI>}
 */
async function getParsedDocs(path) {
  const file = await readFile(path, 'utf-8');
  const parsed = JSON.parse(file);
  return parsed;
}

/**
 * @param {string} path
 * @param {IOpenAPI} docs
 */
async function writeDocs(path, docs) {
  await writeFile(path, JSON.stringify(docs, null, 2));
}

/**
 * @param {IOpenAPI} docs
 * @param {string} schemaName
 * @param {ISchema} schema
 *
 * @returns {string} $ref
 */
async function patchSchema(docs, schemaName, schema) {
  const schemas = docs.components.schemas;
  schemas[schemaName] = schema;
  return '#/components/schemas/' + schemaName;
}

/**
 * @param {IOpenAPI} docs
 */
async function patchAuthThrow(docs) {
  const invalid_session_ref = await patchSchema(
    docs,
    'AuthGuard.InvalidSessionException',
    invalid_session_schema,
  );
  const paths = docs.paths;
  for (const pathItem in paths) {
    /** @type {import('./swagger.d.ts').IPathItem} */
    const path = paths[pathItem];
    for (const method in path) {
      /** @type {import('./swagger.d.ts').IOperation} */
      const operation = path[method];
      if (!operation.security) continue;

      operation.responses['403'] = {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: { $ref: invalid_session_ref },
          },
        },
      };
    }
  }
}

async function main() {
  const docs = await getParsedDocs(swagger_path);
  await patchAuthThrow(docs);
  await writeDocs(swagger_path, docs);
}

main();
