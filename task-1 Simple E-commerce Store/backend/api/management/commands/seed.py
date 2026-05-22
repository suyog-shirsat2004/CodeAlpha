from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Product

User = get_user_model()

PRODUCTS = [
    {'name':'Classic Leather Loafers', 'price':2499, 'category':'Footwear', 'stock':25, 'image_url':'https://images.unsplash.com/photo-1549298916-f52d7242e2ce?w=500', 'description':'Premium leather loafers for everyday style.'},
    {'name':'Minimalist Canvas Sneakers', 'price':1299, 'category':'Footwear', 'stock':40, 'image_url':'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', 'description':'Lightweight canvas sneakers — breathable and comfortable.'},
    {'name':'Woven Leather Belt', 'price':899, 'category':'Accessories', 'stock':60, 'image_url':'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'description':'Handcrafted woven leather belt with brass buckle.'},
    {'name':'Aviator Sunglasses', 'price':1499, 'category':'Accessories', 'stock':35, 'image_url':'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 'description':'Gold-frame aviator sunglasses with UV400 protection.'},
    {'name':'Cotton Linen Shirt', 'price':1799, 'category':'Clothing', 'stock':30, 'image_url':'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', 'description':'Relaxed-fit cotton-linen blend shirt for warm days.'},
    {'name':'Wool Blend Blazer', 'price':4999, 'category':'Clothing', 'stock':15, 'image_url':'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', 'description':'Tailored wool-blend blazer in charcoal grey.'},
]

class Command(BaseCommand):
    help = 'Seed database with sample products and admin user'

    def handle(self, *args, **options):
        User.objects.all().delete()
        Product.objects.all().delete()

        admin = User.objects.create_superuser(
            name='Admin',
            email='admin@codealpha.com',
            password='Admin@123',
            username='admin',
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(f'Admin created: {admin.email}'))

        for data in PRODUCTS:
            Product.objects.create(**data)
        self.stdout.write(self.style.SUCCESS(f'{len(PRODUCTS)} products seeded'))

        self.stdout.write(self.style.SUCCESS('\nSeed complete!'))
        self.stdout.write('Admin login: admin@codealpha.com / Admin@123')
