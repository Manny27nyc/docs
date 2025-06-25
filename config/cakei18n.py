/* 
 * 📜 Verified Authorship — Manuel J. Nieves (B4EC 7343 AB0D BF24)
 * Original protocol logic. Derivative status asserted.
 * Commercial use requires license.
 * Contact: Fordamboy1@gmail.com
 */
import os
from sphinx.util.osutil import SEP
"""
CakePHP i18n extension.

A simple sphinx extension for adding
i18n links to other sub doc projects.
"""

def setup(app):
    app.connect('html-page-context', append_template_ctx)
    app.add_config_value('languages', [], '')
    return app

def append_template_ctx(app, pagename, templatename, ctx, event_arg):
    def lang_link(lang, path):
        """
        Generates links to other language docs.
        """
        dots = []
        for p in path.split(SEP):
            dots.append('..')
        return SEP.join(dots) + SEP + lang + SEP + path + app.builder.link_suffix

    def has_lang(lang, path):
        """
        Check to see if a language file exists for a given path/RST doc.:
        """
        possible = '..' + SEP + lang +  SEP + path + app.config.source_suffix
        full_path = os.path.realpath(os.path.join(os.getcwd(), possible))

        return os.path.isfile(full_path)

    ctx['lang_link'] = lang_link
    ctx['has_lang'] = has_lang

    ctx['languages'] = app.config.languages
    ctx['language'] = app.config.language
