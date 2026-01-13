import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Paper, Grid, Chip } from '@mui/material'
import InfiniteScrollSelect from '../components/InfiniteScrollSelect'

interface CategoryOption {
  id: number
  name: string
  description: string
}

interface CountryOption {
  id: number
  code: string
  name: string
}

function Categories() {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [categoryOffset, setCategoryOffset] = useState(0)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [categoryHasMore, setCategoryHasMore] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | number>('')

  const [countries, setCountries] = useState<CountryOption[]>([])
  const [countryOffset, setCountryOffset] = useState(0)
  const [countryLoading, setCountryLoading] = useState(false)
  const [countryHasMore, setCountryHasMore] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string | number>('')

  const pageSize = 50

  // Fetch categories
  const fetchCategories = async (offset: number) => {
    setCategoryLoading(true)
    try {
      const response = await fetch(
        `/api/getcategories?offset=${offset}&pageSize=${pageSize}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      const newCategories = data.records || []
      
      setCategories(prev => [...prev, ...newCategories])
      setCategoryOffset(offset + newCategories.length)
      setCategoryHasMore(newCategories.length === pageSize)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoryLoading(false)
    }
  }

  // Fetch countries
  const fetchCountries = async (offset: number) => {
    setCountryLoading(true)
    try {
      const response = await fetch(
        `/api/getcountries?offset=${offset}&pageSize=${pageSize}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch countries')
      }
      
      const data = await response.json()
      const newCountries = data.records || []
      
      setCountries(prev => [...prev, ...newCountries])
      setCountryOffset(offset + newCountries.length)
      setCountryHasMore(newCountries.length === pageSize)
    } catch (error) {
      console.error('Error fetching countries:', error)
    } finally {
      setCountryLoading(false)
    }
  }

  // Load initial data on mount
  useEffect(() => {
    fetchCategories(0)
    fetchCountries(0)
  }, [])

  const handleLoadMoreCategories = () => {
    if (!categoryLoading && categoryHasMore) {
      fetchCategories(categoryOffset)
    }
  }

  const handleLoadMoreCountries = () => {
    if (!countryLoading && countryHasMore) {
      fetchCountries(countryOffset)
    }
  }

  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory)
  const selectedCountryObj = countries.find(country => country.id === selectedCountry)

  return (
    <Box sx={{ width: '100%', padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Infinite Scroll Select Demo
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select with Infinite Scroll
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Scroll to the bottom of the dropdown to load more options automatically.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfiniteScrollSelect<CategoryOption>
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories}
              loading={categoryLoading}
              hasMore={categoryHasMore}
              onLoadMore={handleLoadMoreCategories}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => option.name}
              placeholder="Select a category"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <InfiniteScrollSelect<CountryOption>
              label="Country"
              value={selectedCountry}
              onChange={setSelectedCountry}
              options={countries}
              loading={countryLoading}
              hasMore={countryHasMore}
              onLoadMore={handleLoadMoreCountries}
              getOptionValue={(option) => option.id}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              placeholder="Select a country"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selected Values
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected Category:
                </Typography>
                {selectedCategoryObj ? (
                  <Box>
                    <Chip 
                      label={selectedCategoryObj.name} 
                      color="primary" 
                      sx={{ mb: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedCategoryObj.description}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No category selected
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected Country:
                </Typography>
                {selectedCountryObj ? (
                  <Box>
                    <Chip 
                      label={`${selectedCountryObj.name} (${selectedCountryObj.code})`} 
                      color="secondary" 
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No country selected
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Loaded Categories:</strong> {categories.length} {!categoryHasMore && '(All loaded)'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Loaded Countries:</strong> {countries.length} {!countryHasMore && '(All loaded)'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Categories
