from django.utils.translation import get_language


def localized(ru_value, en_value):
    """Возвращает значение по активному языку (en при наличии, иначе ru)."""
    lang = get_language() or 'ru'
    if lang == 'en' and en_value:
        return en_value
    return ru_value