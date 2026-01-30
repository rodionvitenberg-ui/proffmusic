from django_filters import rest_framework as filters
from .models import Track

class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    pass

class TrackFilter(filters.FilterSet):
    tags__slug = CharInFilter(field_name='tags__slug', lookup_expr='in', distinct=True)

    category__slug = filters.CharFilter(field_name='category__slug', lookup_expr='exact')

    is_new = filters.BooleanFilter(field_name='is_new')
    price_min = filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = Track
        fields = ['category__slug', 'tags__slug', 'is_new', 'price_min', 'price_max']