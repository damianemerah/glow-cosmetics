"use client";

import {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Focus from "@tiptap/extension-focus";
import TextStyle from "@tiptap/extension-text-style";
import BulletList from "@tiptap/extension-bullet-list";
import FontSize from "@tiptap/extension-font-size";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/constants/ui/index";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  ImageIcon,
  Palette,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  List,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { uploadImageToSupabase } from "@/actions/adminActions";

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface RichTextEditorRef {
  insertContent: (content: string) => void;
  clearContent: () => void;
  focusEditor: () => void;
  setContent: (htmlContent: string) => void;
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      display: {
        default: "inline",
        rendered: false,
      },
    };
  },
});

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: false, // Disable default bullet list to use custom one
        }),
        TextStyle,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Color.configure({
          types: ["textStyle"],
        }),
        FontSize.configure({
          types: ["textStyle"],
        }),
        CustomImage.configure({
          inline: true,
          allowBase64: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 hover:text-blue-800",
          },
        }),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") {
              return "What's the title?";
            }
            return placeholder || "Tell your story...";
          },
        }),
        Focus.configure({
          className: "has-focus",
          mode: "all",
        }),
        Typography,
        Underline,
        BulletList.configure({
          HTMLAttributes: {
            class: "list-disc pl-8 space-y-2",
          },
        }),
      ],
      content: value,
      onUpdate: ({ editor: currentEditor }) => {
        onChange(currentEditor.getHTML());
      },
      editorProps: {
        attributes: {
          class:
            "prose max-w-none min-h-[120px] focus:outline-none " +
            "prose-headings:font-bold prose-headings:text-gray-800 " +
            "prose-p:text-base prose-p:text-gray-600 prose-p:leading-normal ![&>p]:my-2 " +
            "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 " +
            "prose-strong:font-bold prose-strong:text-gray-800 " +
            "prose-ul:list-disc prose-ol:list-decimal " +
            "prose-li:text-gray-600 prose-li:my-2 " +
            "prose-img:rounded-lg prose-img:shadow-md max-w-full " +
            "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic " +
            "prose-hr:border-gray-200 " +
            "prose-pre:bg-gray-50 prose-pre:rounded prose-pre:p-4 " +
            "[&>*]:my-2 " +
            "forced-colors-mode:prose-img:border forced-colors-mode:prose-img:border-solid ",
        },
      },
      immediatelyRender: false,
    });

    useImperativeHandle(ref, () => ({
      insertContent: (contentToInsert: string) => {
        if (editor) {
          editor.chain().focus().insertContent(contentToInsert).run();
        }
      },
      clearContent: () => {
        editor?.commands.clearContent();
      },
      focusEditor: () => {
        editor?.commands.focus();
      },
      setContent: (htmlContent: string) => {
        // <-- IMPLEMENT THIS METHOD
        if (editor) {
          // editor.commands.setContent() will trigger onUpdate,
          // which calls props.onChange, syncing parent state.
          editor.commands.setContent(htmlContent);
        }
      },
    }));

    // Handle file upload
    const handleImageUpload = useCallback(
      async (file: File) => {
        if (!editor) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "product-images");

        setIsUploading(true);
        try {
          const imageUrl = await uploadImageToSupabase(formData);

          if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            toast.success("Image uploaded successfully");
          } else {
            toast.warning("Failed to upload image");
          }
        } catch (error) {
          toast.warning("Error uploading image");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      },
      [editor]
    );

    if (!editor) {
      return null;
    }

    // Color palette from app theme
    const appColors = [
      { name: "Primary", color: "hsl(var(--primary))" },
      { name: "Secondary", color: "hsl(var(--secondary))" },
      { name: "Destructive", color: "hsl(var(--destructive))" },
      { name: "Accent", color: "hsl(var(--accent))" },
      { name: "Muted", color: "hsl(var(--muted))" },
      { name: "Black", color: "#000000" },
      { name: "Red", color: "#f44336" },
      { name: "Blue", color: "#2196f3" },
      { name: "Green", color: "#4caf50" },
      { name: "Purple", color: "#9c27b0" },
      { name: "Pink", color: "#e91e63" },
    ];

    // Font size options
    const fontSizes = [
      { name: "Small", size: "12px" },
      { name: "Normal", size: "16px" },
      { name: "Medium", size: "20px" },
      { name: "Large", size: "24px" },
      { name: "X-Large", size: "30px" },
    ];

    return (
      <div className={`border rounded-md relative ${className}`}>
        <div className="flex flex-wrap items-center p-2 border-b gap-1 bg-white sticky top-0 z-10">
          {/* Text formatting controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-muted" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "bg-muted" : ""}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "bg-muted" : ""}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-muted mx-1" />

          {/* Font size control */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" type="button">
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col space-y-1">
                  {fontSizes.map((fontSize) => (
                    <Button
                      key={fontSize.name}
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="justify-start"
                      onClick={() =>
                        editor.chain().focus().setFontSize(fontSize.size).run()
                      }
                    >
                      <span style={{ fontSize: fontSize.size }}>
                        {fontSize.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-px h-6 bg-muted mx-1" />

          {/* Heading controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
              }
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
              }
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
              }
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-muted mx-1" />

          {/* List controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-muted mx-1" />

          {/* Alignment controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={
                editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""
              }
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={
                editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""
              }
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={
                editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""
              }
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-muted mx-1" />

          {/* Table, Link and Special features */}
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" type="button">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex flex-col space-y-2">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    onChange={(e) => {
                      if (e.target.value) {
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .setLink({ href: e.target.value })
                          .run();
                      } else {
                        editor.chain().focus().unsetLink().run();
                      }
                    }}
                  />
                  <Button
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    type="button"
                  >
                    Remove Link
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Image Upload Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                  // Reset input value so the same file can be selected again
                  e.target.value = "";
                }}
              />
            </div>

            {/* Color Palette */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" type="button">
                  <Palette className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-5 gap-2 p-2">
                  {appColors.map((color) => (
                    <Button
                      key={color.name}
                      type="button"
                      className="w-8 h-8 rounded-full p-0 overflow-hidden border border-gray-200"
                      style={{ backgroundColor: color.color }}
                      onClick={() =>
                        editor.chain().focus().setColor(color.color).run()
                      }
                      title={color.name}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Preview Button */}
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="relative">
          <EditorContent editor={editor} className="p-3" />
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="!lg:w-[95vw] max-w-5xl">
            <DialogHeader>
              <DialogTitle>Content Preview</DialogTitle>
              <DialogDescription>
                This is how your content will appear.
              </DialogDescription>
            </DialogHeader>
            <div className="border p-4 rounded-md bg-white overflow-auto max-h-[60vh]">
              <div
                className="prose prose-sm sm:prose lg:prose-lg"
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
