import io
import os
import zipfile


def iter_zip_entries(items):
    """
    Возвращает пары (arcname, file_path) для всех треков в заказе.

    Трек с одним файлом кладётся в корень, треки внутри сборника — в подпапку
    с именем сборника.
    """
    for item in items:
        if item.track and item.track.audio_file_full:
            fpath = item.track.audio_file_full.path
            if os.path.exists(fpath):
                ext = os.path.splitext(fpath)[1]
                yield f"{item.track.slug}{ext}", fpath

        elif item.collection:
            collection_slug = item.collection.slug
            for track in item.collection.tracks.all():
                if track.audio_file_full:
                    fpath = track.audio_file_full.path
                    if os.path.exists(fpath):
                        ext = os.path.splitext(fpath)[1]
                        yield f"{collection_slug}/{track.slug}{ext}", fpath


def build_order_zip(items):
    """Собирает ZIP-архив в памяти из позиций заказа. Возвращает BytesIO."""
    zip_buffer = io.BytesIO()
    has_files = False
    try:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for arcname, fpath in iter_zip_entries(items):
                zip_file.write(fpath, arcname=arcname)
                has_files = True
    except Exception as e:
        print(f"Zip Error: {e}")
        return None
    if not has_files:
        return None
    zip_buffer.seek(0)
    return zip_buffer