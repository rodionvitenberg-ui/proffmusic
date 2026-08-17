from django.core.management.base import BaseCommand

from music.catalog_snapshot import CATALOG_PATH, write_catalog


class Command(BaseCommand):
    help = "Write the live boutique (rows + file basenames) to music/data/catalog.json"

    def handle(self, *args, **options):
        catalog = write_catalog()
        self.stdout.write(
            f"wrote {CATALOG_PATH} "
            f"categories={len(catalog['categories'])} "
            f"tags={len(catalog['tags'])} "
            f"tracks={len(catalog['tracks'])} "
            f"collections={len(catalog['collections'])}"
        )
