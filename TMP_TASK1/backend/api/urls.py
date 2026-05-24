from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),

    # Auth
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/me/', views.get_me, name='get-me'),
    path('auth/me/update/', views.update_me, name='update-me'),
    path('auth/change-password/', views.change_password, name='change-password'),

    # Products
    path('products/', views.get_products, name='products'),
    path('products/categories/', views.get_categories, name='categories'),
    path('products/<int:pk>/', views.get_product, name='product'),
    path('products/<int:pk>/reviews/', views.add_review, name='add-review'),

    # Cart
    path('cart/', views.get_cart, name='cart'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/<int:item_id>/', views.update_cart_item, name='update-cart-item'),
    path('cart/<int:item_id>/remove/', views.remove_cart_item, name='remove-cart-item'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),

    # Orders
    path('orders/', views.place_order, name='place-order'),
    path('orders/my/', views.get_my_orders, name='my-orders'),
    path('orders/<int:pk>/', views.get_order, name='order'),
    path('orders/<int:pk>/cancel/', views.cancel_order, name='cancel-order'),

    # Admin - only admin
    path('products/create/', views.create_product, name='create-product'),
    path('products/<int:pk>/update/', views.update_product, name='update-product'),
    path('products/<int:pk>/delete/', views.delete_product, name='delete-product'),
    path('orders/all/', views.get_all_orders, name='all-orders'),
    path('orders/<int:pk>/status/', views.update_order_status, name='update-order-status'),
]
