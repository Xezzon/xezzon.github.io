/* global hexo */

'use strict';

const crypto = require('crypto');
const nextFont = require('./font');
const nextUrl = require('./next-url');

hexo.extend.helper.register('next_font', nextFont);
hexo.extend.helper.register('next_url', nextUrl);

hexo.extend.helper.register('next_inject', function(point) {
  return this.theme.injects[point]
    .map(item => this.partial(item.layout, item.locals, item.options))
    .join('');
});

hexo.extend.helper.register('next_js', function(file, pjax = false) {
  const { next_version } = this;
  const { internal } = this.theme.vendors;
  const links = {
    local   : this.url_for(`${this.theme.js}/${file}`),
    jsdelivr: `//cdn.jsdelivr.net/npm/hexo-theme-next@${next_version}/source/js/${file}`,
    unpkg   : `//unpkg.com/hexo-theme-next@${next_version}/source/js/${file}`
  };
  const src = links[internal] || links.local;
  return `<script ${pjax ? 'data-pjax ' : ''}src="${src}"></script>`;
});

hexo.extend.helper.register('post_edit', function(src) {
  const { theme } = this;
  if (!theme.post_edit.enable) return '';
  return this.next_url(theme.post_edit.url + src, '<i class="fa fa-pen-nib"></i>', {
    class: 'post-edit-link',
    title: this.__('post.edit')
  });
});

hexo.extend.helper.register('post_nav', function(post) {
  const { theme } = this;
  if (theme.post_navigation === false || (!post.prev && !post.next)) return '';
  const prev = theme.post_navigation === 'right' ? post.prev : post.next;
  const next = theme.post_navigation === 'right' ? post.next : post.prev;
  const left = prev ? `
    <a href="${this.url_for(prev.path)}" rel="prev" title="${prev.title}">
      <i class="fa fa-chevron-left"></i> ${prev.title}
    </a>` : '';
  const right = next ? `
    <a href="${this.url_for(next.path)}" rel="next" title="${next.title}">
      ${next.title} <i class="fa fa-chevron-right"></i>
    </a>` : '';
  return `
    <div class="post-nav">
      <div class="post-nav-item">${left}</div>
      <div class="post-nav-item">${right}</div>
    </div>`;
});

hexo.extend.helper.register('gitalk_md5', function(path) {
  const str = this.url_for(path);
  return crypto.createHash('md5').update(str).digest('hex');
});

/**
 * Get page path given a certain language tag
 */
hexo.extend.helper.register('i18n_path', function(language) {
  const { path, lang } = this.page;
  const base = path.startsWith(lang) ? path.slice(lang.length + 1) : path;
  return this.url_for(`${this.languages.indexOf(language) === 0 ? '' : '/' + language}/${base}`);
});

/**
 * Get the language name
 */
hexo.extend.helper.register('language_name', function(language) {
  const name = hexo.theme.i18n.__(language)('name');
  return name === 'name' ? language : name;
});
