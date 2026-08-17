import json
from pathlib import Path

from django.core.management.base import BaseCommand

from music.models import Track

LEDGER = Path(__file__).resolve().parents[2] / "data" / "track_copy.json"


class Command(BaseCommand):
    help = "Load original RU/EN track copy from music/data/track_copy.json"

    def handle(self, *args, **options):
        payload = json.loads(LEDGER.read_text(encoding="utf-8"))
        updated = 0
        missing = []
        for key, copy in payload.items():
            pk = int(key)
            n = Track.objects.filter(pk=pk).update(
                description_short_ru=copy["short_ru"],
                description_short_en=copy["short_en"],
                description_full_ru=copy["full_ru"],
                description_full_en=copy["full_en"],
            )
            if n:
                updated += n
            else:
                missing.append(pk)
        self.stdout.write(f"updated {updated} of {len(payload)}")
        if missing:
            self.stdout.write(self.style.WARNING(f"missing ids: {missing}"))
