from django.core.management.base import BaseCommand, CommandError

from ai.ml.train import train_model


class Command(BaseCommand):
    help = "Train the resume classification model and save its private artifacts."

    def handle(self, *args, **options):
        try:
            metrics = train_model()
        except (FileNotFoundError, ValueError) as error:
            raise CommandError(str(error)) from error
        self.stdout.write(
            self.style.SUCCESS(
                f"Trained {metrics['selected_model']} with macro-F1 "
                f"{metrics['test_macro_f1']:.4f}."
            )
        )
