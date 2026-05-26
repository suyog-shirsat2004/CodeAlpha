from django.db.models import Q, Avg
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Product, Review, Cart, CartItem, Order, OrderItem
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer,
    ProductListSerializer, ProductDetailSerializer, ReviewCreateSerializer,
    CartSerializer, AddToCartSerializer,
    OrderSerializer, PlaceOrderSerializer, UpdateOrderStatusSerializer,
)
from .permissions import IsAdminUser

# ─── Helpers ───────────────────────────────────────────────────────────────────

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }

def error_response(message, code=400):
    return Response({'success': False, 'message': message}, status=code)

def ok_response(data=None, message=None, code=200):
    body = {'success': True}
    if data is not None:
        body.update(data)
    if message:
        body['message'] = message
    return Response(body, status=code)

# ─── API Root ──────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'message': 'CodeAlpha E-commerce API is running',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'me': '/api/auth/me/',
            },
            'products': {
                'list': '/api/products/',
                'categories': '/api/products/categories/',
            },
            'cart': '/api/cart/',
            'orders': '/api/orders/',
        },
    })

# ─── Auth ──────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)
    user = serializer.save()
    tokens = get_tokens_for_user(user)
    return ok_response({
        'token': tokens['access'],
        'user': UserSerializer(user).data,
    }, code=201)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response('Invalid email or password', 401)
    user = serializer.validated_data['user']
    tokens = get_tokens_for_user(user)
    return ok_response({
        'token': tokens['access'],
        'user': UserSerializer(user).data,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    return ok_response({'user': UserSerializer(request.user).data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_me(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)
    serializer.save()
    return ok_response({'user': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)
    if not request.user.check_password(serializer.data['current_password']):
        return error_response('Current password is incorrect', 400)
    request.user.set_password(serializer.data['new_password'])
    request.user.save()
    return ok_response(message='Password changed successfully')

# ─── Products ──────────────────────────────────────────────────────────────────

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'limit'

@api_view(['GET'])
@permission_classes([AllowAny])
def get_products(request):
    queryset = Product.objects.all()
    keyword = request.query_params.get('keyword')
    category = request.query_params.get('category')
    min_price = request.query_params.get('minPrice')
    max_price = request.query_params.get('maxPrice')
    sort = request.query_params.get('sort')

    if keyword:
        queryset = queryset.filter(name__icontains=keyword)
    if category:
        queryset = queryset.filter(category=category)
    if min_price:
        queryset = queryset.filter(price__gte=min_price)
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    sort_map = {
        'newest': '-created_at',
        'oldest': 'created_at',
        'price-asc': 'price',
        'price-desc': '-price',
        'rating': '-average_rating',
    }
    ordering = sort_map.get(sort, '-created_at')
    queryset = queryset.order_by(ordering)

    paginator = ProductPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = ProductListSerializer(page, many=True)
    return Response({
        'success': True,
        'total': paginator.page.paginator.count,
        'page': paginator.page.number,
        'pages': paginator.page.paginator.num_pages,
        'products': serializer.data,
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return error_response('Product not found', 404)
    serializer = ProductDetailSerializer(product)
    return ok_response({'product': serializer.data})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    categories = Product.objects.values_list('category', flat=True).distinct()
    return ok_response({'categories': list(categories)})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_product(request):
    serializer = ProductListSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)
    serializer.save()
    return ok_response({'product': serializer.data}, code=201)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return error_response('Product not found', 404)
    serializer = ProductListSerializer(product, data=request.data, partial=True)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)
    serializer.save()
    return ok_response({'product': serializer.data})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return error_response('Product not found', 404)
    product.delete()
    return ok_response(message='Product deleted')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return error_response('Product not found', 404)

    if Review.objects.filter(product=product, user=request.user).exists():
        return error_response('You have already reviewed this product', 400)

    serializer = ReviewCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)

    Review.objects.create(
        product=product,
        user=request.user,
        name=request.user.name or request.user.email,
        rating=serializer.validated_data['rating'],
        comment=serializer.validated_data.get('comment', ''),
    )

    avg = product.reviews.aggregate(Avg('rating'))['rating__avg']
    product.average_rating = round(avg, 1) if avg else 0
    product.save()

    return ok_response({'product': ProductDetailSerializer(product).data}, code=201)

# ─── Cart ──────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return ok_response({'cart': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    serializer = AddToCartSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)

    try:
        pid = serializer.data.get('product_id') or serializer.data.get('productId')
        product = Product.objects.get(pk=pid)
    except Product.DoesNotExist:
        return error_response('Product not found', 404)

    quantity = serializer.data['quantity']
    if product.stock < quantity:
        return error_response(f'Insufficient stock. Only {product.stock} available.', 400)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item = cart.items.filter(product=product).first()

    if item:
        new_qty = item.quantity + quantity
        if product.stock < new_qty:
            return error_response(f'Insufficient stock. Only {product.stock} available.', 400)
        item.quantity = new_qty
        item.save()
    else:
        CartItem.objects.create(cart=cart, product=product, quantity=quantity, price=product.price)

    serializer = CartSerializer(cart)
    return ok_response({'cart': serializer.data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    try:
        cart = Cart.objects.get(user=request.user)
        item = cart.items.get(pk=item_id)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return error_response('Item not found in cart', 404)

    try:
        quantity = int(request.data.get('quantity', 0))
    except (TypeError, ValueError):
        return error_response('Invalid quantity', 400)

    if quantity < 1:
    if item.product.stock < quantity:
        return error_response(f'Insufficient stock. Only {item.product.stock} available.', 400)

    item.quantity = quantity
    item.save()

    serializer = CartSerializer(cart)
    return ok_response({'cart': serializer.data})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, item_id):
    try:
        cart = Cart.objects.get(user=request.user)
        item = cart.items.get(pk=item_id)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return error_response('Item not found in cart', 404)

    item.delete()
    serializer = CartSerializer(cart)
    return ok_response({'cart': serializer.data})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    try:
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
    except Cart.DoesNotExist:
        pass
    return ok_response(message='Cart cleared')

# ─── Orders ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    serializer = PlaceOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)

    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return error_response('Your cart is empty', 400)

    items = CartItem.objects.filter(cart=cart).select_related('product')
    if not items.exists():
        return error_response('Your cart is empty', 400)

    for item in items:
        if item.product.stock < item.quantity:
            return error_response(f'Insufficient stock for "{item.product.name}". Only {item.product.stock} left.', 400)

    items_price = sum(item.subtotal for item in items)
    shipping_price = 0 if items_price >= 500 else 49
    total_price = items_price + shipping_price

    data = serializer.validated_data
    order = Order.objects.create(
        user=request.user,
        shipping_name=data['shipping_name'],
        shipping_street=data['shipping_street'],
        shipping_city=data['shipping_city'],
        shipping_state=data['shipping_state'],
        shipping_pincode=data['shipping_pincode'],
        shipping_phone=data['shipping_phone'],
        payment_method=data.get('payment_method', 'COD'),
        items_price=items_price,
        shipping_price=shipping_price,
        total_price=total_price,
    )

    for item in items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            name=item.product.name,
            image_url=item.product.image_url,
            quantity=item.quantity,
            price=item.price,
        )
        item.product.stock -= item.quantity
        item.product.save()

    cart.items.all().delete()

    return ok_response({'order': OrderSerializer(order).data}, code=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return ok_response({'count': len(orders), 'orders': serializer.data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return error_response('Order not found', 404)

    if order.user != request.user and request.user.role != 'admin':
        return error_response('Not authorised', 403)

    return ok_response({'order': OrderSerializer(order).data})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_orders(request):
    queryset = Order.objects.all()
    status_filter = request.query_params.get('status')
    if status_filter:
        queryset = queryset.filter(order_status=status_filter)
    queryset = queryset.order_by('-created_at')

    paginator = ProductPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = OrderSerializer(page, many=True)
    return Response({
        'success': True,
        'total': paginator.page.paginator.count,
        'page': paginator.page.number,
        'orders': serializer.data,
    })

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return error_response('Order not found', 404)

    serializer = UpdateOrderStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors, 400)

    order.order_status = serializer.data['order_status']
    if serializer.data['order_status'] == 'Delivered':
        order.delivered_at = timezone.now()
        order.payment_status = 'Paid'
    order.save()

    return ok_response({'order': OrderSerializer(order).data})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return error_response('Order not found', 404)

    if order.user != request.user:
        return error_response('Not authorised', 403)

    if order.order_status not in ['Processing', 'Confirmed']:
        return error_response('Cannot cancel order after it has been shipped', 400)

    order.order_status = 'Cancelled'
    order.save()

    for item in order.items.all():
        if item.product:
            item.product.stock += item.quantity
            item.product.save()

    return ok_response(message='Order cancelled', data={'order': OrderSerializer(order).data})
