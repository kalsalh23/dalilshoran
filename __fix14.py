# -*- coding: utf-8 -*-
import io
path = 'C:\\Users\\DELL\\Desktop\\dalilshoran-main\\dalilshoran-main\\js\\app.js'
with io.open(path, 'r', encoding='utf-8') as f:
    content = f.read()
# Fix corrupted Arabic text in quick-nav chips
content = content.replace('\u0627\u0644\u0633\u064a\u062f\u0644\u064a\u0627\u062a', '\u0627\u0644\u0633\u064a\u062f\u0644\u064a\u0627\u062a')
content = content.replace('azen', '\u0627\u0632\u0644')
with io.open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')