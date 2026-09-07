import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../select'
import { Badge } from '../badge'
import { Tabs, TabsList, TabsTrigger } from '../tabs'
import { Button } from '../button'
import { Input } from '../input'
import { FileDropzone } from '../file-dropzone'

describe('Official shadcn UI Components', () => {
  describe('Dialog', () => {
    it('renders dialog content when open', () => {
      render(
        <Dialog open={true} onOpenChange={vi.fn()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Title</DialogTitle>
            </DialogHeader>
            <p>Dialog Body Content</p>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Body Content')).toBeInTheDocument()
    })
  })

  describe('Select', () => {
    it('renders select trigger and options', () => {
      render(
        <Select value="opt1">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option 1</SelectItem>
            <SelectItem value="opt2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Button', () => {
    it('renders button element with text', () => {
      render(<Button>Click Me</Button>)
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument()
    })
  })

  describe('Input', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })
  })

  describe('Badge', () => {
    it('renders badge children', () => {
      render(<Badge variant="secondary">Active</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('Tabs', () => {
    it('renders tabs triggers', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
    })
  })

  describe('FileDropzone', () => {
    it('renders dropzone prompt and handles file selection', () => {
      const onFileSelect = vi.fn()
      render(<FileDropzone onFileSelect={onFileSelect} label="Upload your receipt" />)

      expect(screen.getByText('Upload your receipt')).toBeInTheDocument()

      const file = new File(['dummy content'], 'receipt.png', { type: 'image/png' })
      const dropzone = screen.getByText('Upload your receipt').parentElement

      if (dropzone) {
        fireEvent.drop(dropzone, {
          dataTransfer: {
            files: [file],
          },
        })
      }

      expect(onFileSelect).toHaveBeenCalledWith(file)
    })
  })
})

