import json
from pathlib import Path

from django.core.management.base import BaseCommand

from music.models import Collection, Tag, Track

ROOT = Path(__file__).resolve().parents[2] / "data"
TRACKS = ROOT / "track_copy.json"
COLLECTIONS = ROOT / "collection_copy.json"


class Command(BaseCommand):
    help = "Load original RU/EN titles and copy for tracks and collections"

    def handle(self, *args, **options):
        tracks = json.loads(TRACKS.read_text(encoding="utf-8"))
        updated = 0
        missing = []
        for key, copy in tracks.items():
            pk = int(key)
            fields = {
                "description_short_ru": copy["short_ru"],
                "description_short_en": copy["short_en"],
                "description_full_ru": copy["full_ru"],
                "description_full_en": copy["full_en"],
            }
            if copy.get("title_en"):
                fields["title_en"] = copy["title_en"]
            n = Track.objects.filter(pk=pk).update(**fields)
            if n:
                updated += n
            else:
                missing.append(pk)
        self.stdout.write(f"tracks updated {updated} of {len(tracks)}")
        if missing:
            self.stdout.write(self.style.WARNING(f"missing track ids: {missing}"))

        cols = json.loads(COLLECTIONS.read_text(encoding="utf-8"))
        c_upd = 0
        for key, copy in cols.items():
            c_upd += Collection.objects.filter(pk=int(key)).update(
                title_ru=copy["title_ru"],
                title_en=copy["title_en"],
                description_ru=copy["description_ru"],
                description_en=copy["description_en"],
            )
        self.stdout.write(f"collections updated {c_upd} of {len(cols)}")

        tag_en = Tag.objects.filter(slug="bez-content-id").update(
            name_ru="без Content ID",
            name_en="No Content ID",
        )
        self.stdout.write(f"usage tags touched {tag_en}")
