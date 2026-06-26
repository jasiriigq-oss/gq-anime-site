import type { Field } from 'payload'
import { INCLUDE_SEO_FIELD_NAME } from '../../seo/plugin'
import { INCLUDE_IMPORT_EXPORT_NAME } from '../../importexport/plugin'
import { INCLUDE_NESTED_DOC_NAME } from '../../nested-doc/plugin'
import { EXCERPT_FIELD_SEARCH_NAME, INCLUDE_SEARCH_NAME } from '../../search/plugin'

export const getCommonPageFields = ({
  include_seo = false,
  include_import_export = false,
  include_nested_doc = false,
  include_search = false,
  include_redirects = false,
}) => {
  const fields: Field[] = []

  if (include_seo) {
    fields.push({
      name: INCLUDE_SEO_FIELD_NAME,
      label: 'Include SEO',
      type: 'checkbox',
      defaultValue: include_seo,
      hidden: true,
    })
  }
  if (include_import_export) {
    fields.push({
      name: INCLUDE_IMPORT_EXPORT_NAME,
      label: 'Include SEO',
      type: 'checkbox',
      defaultValue: include_import_export,
      hidden: true,
    })
  }

  if (include_nested_doc) {
    fields.push({
      name: INCLUDE_NESTED_DOC_NAME,
      label: 'Include Nested Doc',
      type: 'checkbox',
      defaultValue: include_nested_doc,
      hidden: true,
    })
  }

  if (include_search) {
    fields.push({
      name: INCLUDE_SEARCH_NAME,
      label: 'Include Search',
      type: 'checkbox',
      defaultValue: include_search,
      hidden: true,
    })
    fields.push({
      name: EXCERPT_FIELD_SEARCH_NAME,
      label: 'Search Excerpt',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    })
  }

  if (include_redirects) {
    fields.push({
      name: 'include-redirects-doc',
      label: 'Include Redirects',
      type: 'checkbox',
      defaultValue: include_redirects,
      hidden: true,
    })
  }

  fields.push({
    name: 'slug',
    label: 'Slug',
    type: 'text',
    index: true,
    unique: true,
    required: true,
  })

  fields.push({
    name: 'title',
    label: 'Title',
    type: 'text',
  })

  fields.push({
    name: 'published',
    label: 'Published',
    type: 'checkbox',
    defaultValue: false,
  })

  return fields
}
