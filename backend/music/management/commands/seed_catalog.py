from datetime import timedelta
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import connection

from music.catalog_snapshot import (
    COLLECTION_COVERS,
    COVERS,
    load_catalog,
    full_dir,
    preview_dir,
)
from music.models import Category, Collection, Tag, Track


def _parse_duration(value: str):
    if not value:
        return None
    parts = value.split(":")
    try:
        parts = [int(p) for p in parts]
    except ValueError:
        return None
    if len(parts) == 3:
        return timedelta(hours=parts[0], minutes=parts[1], seconds=parts[2])
    if len(parts) == 2:
        return timedelta(minutes=parts[0], seconds=parts[1])
    return None


def _attach(field, source: Path, stored_name: str) -> str:
    with source.open("rb") as fh:
        field.save(stored_name, File(fh), save=False)
    return field.name


def _reset_pk(table: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT setval(pg_get_serial_sequence(%s, 'id'), "
            f"COALESCE((SELECT MAX(id) FROM {table}), 1))",
            [table],
        )


class Command(BaseCommand):
    help = "Replay the boutique snapshot. Never generates covers."

    def handle(self, *args, **options):
        catalog = load_catalog()
        missing_audio = 0
        missing_covers = 0

        for row in catalog["categories"]:
            Category.objects.update_or_create(
                pk=row["id"],
                defaults={
                    "slug": row["slug"],
                    "name_ru": row["name_ru"],
                    "name_en": row["name_en"],
                    "order": row["order"],
                },
            )
        for row in catalog["tags"]:
            Tag.objects.update_or_create(
                pk=row["id"],
                defaults={
                    "slug": row["slug"],
                    "name_ru": row["name_ru"],
                    "name_en": row["name_en"],
                    "tag_type": row["tag_type"],
                },
            )

        previews = preview_dir()
        fulls = full_dir()

        for row in catalog["tracks"]:
            defaults = {
                "slug": row["slug"],
                "title_ru": row["title_ru"],
                "title_en": row["title_en"],
                "description_short_ru": row["description_short_ru"],
                "description_short_en": row["description_short_en"],
                "description_full_ru": row["description_full_ru"],
                "description_full_en": row["description_full_en"],
                "price": row["price"],
                "category_id": row["category_id"],
                "is_new": row["is_new"],
                "is_popular": row["is_popular"],
                "duration": _parse_duration(row.get("duration") or ""),
                "preview_start_time": row.get("preview_start_time", 0),
                "preview_duration": row.get("preview_duration", 30),
                "auto_generate_preview": False,
            }
            exists = Track.objects.filter(pk=row["id"]).exists()
            if not exists:
                defaults["purchases_count"] = row.get("purchases_count", 0)
            track, _ = Track.objects.update_or_create(pk=row["id"], defaults=defaults)
            track.tags.set(row["tag_ids"])

            file_updates = {}
            cover_src = COVERS / f"{row['id']}.jpg"
            if cover_src.is_file():
                file_updates["cover_image"] = _attach(track.cover_image, cover_src, f"{row['id']}.jpg")
            else:
                missing_covers += 1
                self.stderr.write(f"missing cover {cover_src}")

            preview_name = row.get("preview") or ""
            preview_src = previews / preview_name if preview_name else None
            if preview_src and preview_src.is_file():
                file_updates["audio_file_preview"] = _attach(
                    track.audio_file_preview, preview_src, preview_name
                )
            else:
                missing_audio += 1
                self.stderr.write(f"missing preview track={row['id']} {preview_name}")

            full_name = row.get("full") or ""
            full_src = fulls / full_name if full_name else None
            if full_src and full_src.is_file():
                file_updates["audio_file_full"] = _attach(track.audio_file_full, full_src, full_name)
            else:
                missing_audio += 1
                self.stderr.write(f"missing full track={row['id']} {full_name}")

            if file_updates:
                Track.objects.filter(pk=track.pk).update(**file_updates)

        for row in catalog["collections"]:
            col, _ = Collection.objects.update_or_create(
                pk=row["id"],
                defaults={
                    "slug": row["slug"],
                    "title_ru": row["title_ru"],
                    "title_en": row["title_en"],
                    "description_ru": row["description_ru"],
                    "description_en": row["description_en"],
                    "price": row["price"],
                    "is_new": row["is_new"],
                },
            )
            col.tracks.set(row["track_ids"])
            cover_src = COLLECTION_COVERS / f"{row['id']}.jpg"
            if cover_src.is_file():
                name = _attach(col.cover_image, cover_src, f"{row['id']}.jpg")
                Collection.objects.filter(pk=col.pk).update(cover_image=name)
            else:
                missing_covers += 1
                self.stderr.write(f"missing collection cover {cover_src}")

        for table in ("music_category", "music_tag", "music_track", "music_collection"):
            _reset_pk(table)

        self.stdout.write(
            f"seeded categories={len(catalog['categories'])} "
            f"tags={len(catalog['tags'])} "
            f"tracks={len(catalog['tracks'])} "
            f"collections={len(catalog['collections'])} "
            f"missing_audio={missing_audio} missing_covers={missing_covers}"
        )
