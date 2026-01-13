import { useState, useRef, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  SelectChangeEvent,
  Typography
} from '@mui/material'

export interface InfiniteScrollSelectProps<T = any> {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  options: T[]
  loading?: boolean
  hasMore?: boolean
  onLoadMore: () => void
  getOptionValue: (option: T) => string | number
  getOptionLabel: (option: T) => string
  placeholder?: string
  disabled?: boolean
  fullWidth?: boolean
}

function InfiniteScrollSelect<T = any>({
  label,
  value,
  onChange,
  options,
  loading = false,
  hasMore = true,
  onLoadMore,
  getOptionValue,
  getOptionLabel,
  placeholder = 'Select an option',
  disabled = false,
  fullWidth = true
}: InfiniteScrollSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const menuListRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    onChange(event.target.value)
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    // Check if scrolled near the bottom (within 50px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore && !loadingRef.current) {
      loadingRef.current = true
      onLoadMore()
    }
  }

  // Reset loading ref when loading completes
  useEffect(() => {
    if (!loading) {
      loadingRef.current = false
    }
  }, [loading])

  return (
    <FormControl fullWidth={fullWidth} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={handleChange}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        MenuProps={{
          PaperProps: {
            onScroll: handleScroll,
            ref: menuListRef,
            style: {
              maxHeight: 300
            }
          }
        }}
      >
        {placeholder && !value && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
        {loading && (
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 1, gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading more options...
              </Typography>
            </Box>
          </MenuItem>
        )}
        {!hasMore && options.length > 0 && (
          <MenuItem disabled>
            <Box sx={{ textAlign: 'center', width: '100%', py: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
              No more options
            </Box>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default InfiniteScrollSelect
