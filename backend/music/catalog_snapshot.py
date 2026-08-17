import json
from pathlib import Path

from django.conf import settings

DATA = Path(__file__).resolve().parent / "data"
CATALOG_PATH = DATA / "catalog.json"
COVERS = DATA / "covers"
COLLECTION_COVERS = DATA / "collection_covers"


def _basename(field) -> str:
    if not field:
        return ""
    return Path(field.name).name


def dump_catalog() -> dict:
    from music.models import Category, Collection, Tag, Track

    return {
        "categories": [
            {
                "id": c.pk,
                "slug": c.slug,
                "name_ru": c.name_ru,
                "name_en": c.name_en,
                "order": c.order,
            }
            for c in Category.objects.order_by("id")
        ],
        "tags": [
            {
                "id": t.pk,
                "slug": t.slug,
                "name_ru": t.name_ru,
                "name_en": t.name_en,
                "tag_type": t.tag_type,
            }
            for t in Tag.objects.order_by("id")
        ],
        "tracks": [
            {
                "id": tr.pk,
                "slug": tr.slug,
                "title_ru": tr.title_ru,
                "title_en": tr.title_en,
                "description_short_ru": tr.description_short_ru,
                "description_short_en": tr.description_short_en,
                "description_full_ru": tr.description_full_ru,
                "description_full_en": tr.description_full_en,
                "price": str(tr.price),
                "category_id": tr.category_id,
                "tag_ids": list(tr.tags.order_by("id").values_list("id", flat=True)),
                "is_new": tr.is_new,
                "is_popular": tr.is_popular,
                "purchases_count": tr.purchases_count,
                "duration": str(tr.duration) if tr.duration else "",
                "preview_start_time": tr.preview_start_time,
                "preview_duration": tr.preview_duration,
                "cover": f"covers/{tr.pk}.jpg",
                "preview": _basename(tr.audio_file_preview),
                "full": _basename(tr.audio_file_full),
            }
            for tr in Track.objects.order_by("id")
        ],
        "collections": [
            {
                "id": col.pk,
                "slug": col.slug,
                "title_ru": col.title_ru,
                "title_en": col.title_en,
                "description_ru": col.description_ru,
                "description_en": col.description_en,
                "price": str(col.price),
                "is_new": col.is_new,
                "track_ids": list(col.tracks.order_by("id").values_list("id", flat=True)),
                "cover": f"collection_covers/{col.pk}.jpg",
            }
            for col in Collection.objects.order_by("id")
        ],
    }


def write_catalog(path: Path = CATALOG_PATH) -> dict:
    catalog = dump_catalog()
    path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return catalog


def load_catalog(path: Path = CATALOG_PATH) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def preview_dir() -> Path:
    return Path(settings.MEDIA_ROOT) / "previews"


def full_dir() -> Path:
    return Path(settings.PROTECTED_MEDIA_ROOT) / "tracks"
