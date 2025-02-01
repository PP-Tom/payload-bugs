import type { CollectionConfig } from 'payload'

import slugify from 'slugify'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    components: {
      beforeListTable: ['/components/Seed#Seed'],
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Title',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
            },
            {
              name: 'fallback',
              type: 'text',
              localized: true,
            },
            {
              name: 'slug',
              type: 'text',
              unique: true,
              required: true,
              hooks: {
                beforeValidate: [
                  ({ value, siblingData }) => {
                    if (typeof value === 'string') {
                      return slugify(value, { lower: true, trim: true })
                    } else if (typeof siblingData?.title === 'string') {
                      return slugify(siblingData.title, { lower: true, trim: true })
                    }

                    return value
                  },
                ],
              },
            },
          ],
        },

        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'textarea',
              localized: true,
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 300,
      },
    },
  },
  endpoints: [
    {
      path: '/seed',
      method: 'post',
      handler: async ({ payload }) => {
        try {
          payload.logger.info('Seeding database...')

          const locales = payload.config.localization
          if (!locales) return Response.json({ error: 'Data unable to seed' })

          const localizeData = (value: string) => {
            const data: Record<(typeof locales.localeCodes)[number], string> = {}
            for (const code of locales.localeCodes) data[code] = `${value} - ${code}`
            return data
          }

          await Promise.all(
            Array.from({ length: 10 }, async (_, index: number) => {
              const data = await payload.db.create({
                collection: 'projects',
                data: {
                  title: localizeData(`Title ${index}`),
                  fallback: { en: 'Fallback' },
                },
              })

              await payload.db.createVersion({
                parent: data.id,
                collectionSlug: 'projects',
                versionData: data,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                autosave: false,
              })
            }),
          )

          return Response.json({ success: 'Data seeded' })
        } catch (error) {
          return Response.json({ error: 'Data unable to seed' })
        }
      },
    },
  ],
}
