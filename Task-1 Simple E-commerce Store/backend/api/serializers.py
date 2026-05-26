from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Product, Review, Cart, CartItem, Order, OrderItem

# ─── Auth ──────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'username']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data.get('username', validated_data['email']),
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),
        )

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password')
        data['user'] = user
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'address_street', 'address_city', 'address_state', 'address_pincode']

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

# ─── Product ───────────────────────────────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'name']

class ProductListSerializer(serializers.ModelSerializer):
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'stock', 'image_url', 'average_rating', 'review_count', 'created_at']

    def get_review_count(self, obj):
        return obj.reviews.count()

class ProductDetailSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'stock', 'image_url', 'average_rating', 'reviews', 'created_at']

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value

# ─── Cart ──────────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.URLField(source='product.image_url', read_only=True)
    product_stock = serializers.IntegerField(source='product.stock', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_image', 'product_stock', 'quantity', 'price', 'subtotal']
        read_only_fields = ['price']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'total_items']

    def get_total_price(self, obj):
        return sum(item.subtotal for item in obj.items.all())

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    productId = serializers.IntegerField(required=False, source='product_id')
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate(self, data):
        if 'product_id' not in data or data.get('product_id') is None:
            raise serializers.ValidationError({'product_id': 'This field is required.'})
        return data

# ─── Order ─────────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'name', 'image_url', 'quantity', 'price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'items', 'shipping_name', 'shipping_street', 'shipping_city',
            'shipping_state', 'shipping_pincode', 'shipping_phone',
            'payment_method', 'payment_status', 'items_price', 'shipping_price',
            'total_price', 'order_status', 'delivered_at', 'created_at',
        ]

class PlaceOrderSerializer(serializers.Serializer):
    shipping_name = serializers.CharField()
    shipping_street = serializers.CharField()
    shipping_city = serializers.CharField()
    shipping_state = serializers.CharField()
    shipping_pincode = serializers.CharField()
    shipping_phone = serializers.CharField()
    payment_method = serializers.CharField(default='COD')

class UpdateOrderStatusSerializer(serializers.Serializer):
    order_status = serializers.ChoiceField(choices=Order.Status.choices)
