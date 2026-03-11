import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync, statSync } from 'fs'

// Recursively find all HTML files in a directory
function getHtmlEntries(dir, baseDir = dir) {
  const entries = {}
  const files = readdirSync(dir)
  
  for (const file of files) {
    const filePath = resolve(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      Object.assign(entries, getHtmlEntries(filePath, baseDir))
    } else if (file.endsWith('.html')) {
      const relativePath = filePath.replace(baseDir + '/', '')
      const name = relativePath.replace(/\.html$/, '').replace(/\//g, '-')
      entries[name] = filePath
    }
  }
  
  return entries
}

export default defineConfig({
  server: {
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...getHtmlEntries(resolve(__dirname, 'prototype-plg-automations'))
      }
    }
  }
})
