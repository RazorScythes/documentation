import {
    faColumns, faSquare, faHeading, faAlignLeft, faImage,
    faMousePointer, faGripLines, faArrowsAltV,
    faTableColumns, faGrip, faArrowsLeftRight,
    faVideo, faListUl, faIcons, faShareNodes, faMapMarkerAlt, faCode
} from '@fortawesome/free-solid-svg-icons'
import SectionRenderer from './components/renderers/SectionRenderer'
import ContainerRenderer from './components/renderers/ContainerRenderer'
import HeadingRenderer from './components/renderers/HeadingRenderer'
import TextRenderer from './components/renderers/TextRenderer'
import ImageRenderer from './components/renderers/ImageRenderer'
import ButtonRenderer from './components/renderers/ButtonRenderer'
import DividerRenderer from './components/renderers/DividerRenderer'
import SpacerRenderer from './components/renderers/SpacerRenderer'
import ColumnsRenderer from './components/renderers/ColumnsRenderer'
import GridRenderer from './components/renderers/GridRenderer'
import FlexRowRenderer from './components/renderers/FlexRowRenderer'
import VideoRenderer from './components/renderers/VideoRenderer'
import ListRenderer from './components/renderers/ListRenderer'
import IconRenderer from './components/renderers/IconRenderer'
import SocialRenderer from './components/renderers/SocialRenderer'
import MapRenderer from './components/renderers/MapRenderer'
import EmbedRenderer from './components/renderers/EmbedRenderer'

export const componentRegistry = {
    section: {
        label: 'Section',
        icon: faColumns,
        category: 'layout',
        canHaveChildren: true,
        defaultProps: {},
        defaultStyles: {
            desktop: { padding: '40px 20px', width: '100%', gap: '16px' },
        },
        propsSchema: [],
        render: SectionRenderer,
    },
    container: {
        label: 'Container',
        icon: faSquare,
        category: 'layout',
        canHaveChildren: true,
        defaultProps: { maxWidth: '1200px' },
        defaultStyles: {
            desktop: { padding: '20px', width: '100%', gap: '12px' },
        },
        propsSchema: [
            { key: 'maxWidth', type: 'text', label: 'Max Width' },
        ],
        render: ContainerRenderer,
    },
    columns: {
        label: 'Columns',
        icon: faTableColumns,
        category: 'layout',
        canHaveChildren: true,
        defaultProps: { columns: '2', gap: '20px' },
        defaultStyles: {
            desktop: { padding: '0', width: '100%' },
        },
        propsSchema: [
            { key: 'columns', type: 'select', label: 'Columns', options: ['1', '2', '3', '4', '5', '6'] },
            { key: 'gap', type: 'text', label: 'Gap' },
        ],
        render: ColumnsRenderer,
    },
    grid: {
        label: 'Grid',
        icon: faGrip,
        category: 'layout',
        canHaveChildren: true,
        defaultProps: { minColumnWidth: '250px', gap: '20px' },
        defaultStyles: {
            desktop: { padding: '0', width: '100%' },
        },
        propsSchema: [
            { key: 'minColumnWidth', type: 'text', label: 'Min Column Width' },
            { key: 'gap', type: 'text', label: 'Gap' },
        ],
        render: GridRenderer,
    },
    flexRow: {
        label: 'Flex Row',
        icon: faArrowsLeftRight,
        category: 'layout',
        canHaveChildren: true,
        defaultProps: { direction: 'row', justify: 'flex-start', align: 'stretch', wrap: 'wrap', gap: '16px' },
        defaultStyles: {
            desktop: { padding: '0', width: '100%' },
        },
        propsSchema: [
            { key: 'direction', type: 'select', label: 'Direction', options: ['row', 'row-reverse', 'column', 'column-reverse'] },
            { key: 'justify', type: 'select', label: 'Justify', options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] },
            { key: 'align', type: 'select', label: 'Align', options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'] },
            { key: 'wrap', type: 'select', label: 'Wrap', options: ['nowrap', 'wrap', 'wrap-reverse'] },
            { key: 'gap', type: 'text', label: 'Gap' },
        ],
        render: FlexRowRenderer,
    },
    heading: {
        label: 'Heading',
        icon: faHeading,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { text: 'Heading', tag: 'h2' },
        defaultStyles: {
            desktop: { fontSize: '32px', fontWeight: '700', color: 'inherit', margin: '0', padding: '0' },
        },
        propsSchema: [
            { key: 'text', type: 'text', label: 'Text' },
            { key: 'tag', type: 'select', label: 'HTML Tag', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
        ],
        render: HeadingRenderer,
    },
    text: {
        label: 'Text',
        icon: faAlignLeft,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { text: 'This is a text block. Click to edit the content in the properties panel.' },
        defaultStyles: {
            desktop: { fontSize: '16px', lineHeight: '1.6', color: 'inherit', margin: '0', padding: '0' },
        },
        propsSchema: [
            { key: 'text', type: 'textarea', label: 'Content' },
        ],
        render: TextRenderer,
    },
    image: {
        label: 'Image',
        icon: faImage,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { src: '', alt: '' },
        defaultStyles: {
            desktop: { width: '100%', maxWidth: '100%', height: 'auto' },
        },
        propsSchema: [
            { key: 'src', type: 'text', label: 'Image URL' },
            { key: 'alt', type: 'text', label: 'Alt Text' },
        ],
        render: ImageRenderer,
    },
    button: {
        label: 'Button',
        icon: faMousePointer,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { text: 'Click Me', url: '', openInNewTab: false },
        defaultStyles: {
            desktop: {
                padding: '12px 24px', fontSize: '14px', fontWeight: '600',
                backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '8px',
            },
        },
        propsSchema: [
            { key: 'text', type: 'text', label: 'Label' },
            { key: 'url', type: 'text', label: 'Link URL' },
            { key: 'openInNewTab', type: 'checkbox', label: 'Open in new tab' },
        ],
        render: ButtonRenderer,
    },
    divider: {
        label: 'Divider',
        icon: faGripLines,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { thickness: '1', style: 'solid', color: '#e2e8f0' },
        defaultStyles: {
            desktop: { margin: '20px 0' },
        },
        propsSchema: [
            { key: 'thickness', type: 'text', label: 'Thickness (px)' },
            { key: 'style', type: 'select', label: 'Style', options: ['solid', 'dashed', 'dotted', 'double'] },
            { key: 'color', type: 'color', label: 'Color' },
        ],
        render: DividerRenderer,
    },
    spacer: {
        label: 'Spacer',
        icon: faArrowsAltV,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { height: '40px' },
        defaultStyles: {
            desktop: {},
        },
        propsSchema: [
            { key: 'height', type: 'text', label: 'Height' },
        ],
        render: SpacerRenderer,
    },
    video: {
        label: 'Video',
        icon: faVideo,
        category: 'media',
        canHaveChildren: false,
        defaultProps: { src: '', controls: true, autoplay: false, loop: false },
        defaultStyles: {
            desktop: { width: '100%' },
        },
        propsSchema: [
            { key: 'src', type: 'text', label: 'Video URL (YouTube, Vimeo, or direct)' },
            { key: 'controls', type: 'checkbox', label: 'Show Controls' },
            { key: 'autoplay', type: 'checkbox', label: 'Autoplay' },
            { key: 'loop', type: 'checkbox', label: 'Loop' },
        ],
        render: VideoRenderer,
    },
    list: {
        label: 'List',
        icon: faListUl,
        category: 'basic',
        canHaveChildren: false,
        defaultProps: { items: 'Item 1\nItem 2\nItem 3', listType: 'ul', bulletStyle: 'disc' },
        defaultStyles: {
            desktop: { fontSize: '16px', lineHeight: '1.6', color: 'inherit', margin: '0', padding: '0' },
        },
        propsSchema: [
            { key: 'items', type: 'textarea', label: 'Items (one per line)' },
            { key: 'listType', type: 'select', label: 'List Type', options: ['ul', 'ol'] },
            { key: 'bulletStyle', type: 'select', label: 'Bullet Style', options: ['disc', 'circle', 'square', 'none'] },
        ],
        render: ListRenderer,
    },
    icon: {
        label: 'Icon',
        icon: faIcons,
        category: 'media',
        canHaveChildren: false,
        defaultProps: { icon: 'star', prefix: 'fas', size: '32px', color: '#3b82f6', link: '' },
        defaultStyles: {
            desktop: { textAlign: 'center', padding: '8px' },
        },
        propsSchema: [
            { key: 'icon', type: 'text', label: 'Icon name (e.g. star, heart, user)' },
            { key: 'prefix', type: 'select', label: 'Style', options: ['fas', 'fab'] },
            { key: 'size', type: 'text', label: 'Size' },
            { key: 'color', type: 'color', label: 'Color' },
            { key: 'link', type: 'text', label: 'Link URL (optional)' },
        ],
        render: IconRenderer,
    },
    social: {
        label: 'Social Links',
        icon: faShareNodes,
        category: 'media',
        canHaveChildren: false,
        defaultProps: {
            size: '24px', gap: '12px', shape: 'circle', style: 'colored',
            facebook: '', twitter: '', instagram: '', youtube: '', tiktok: '',
            linkedin: '', github: '', discord: '', twitch: '', reddit: '',
        },
        defaultStyles: {
            desktop: { padding: '8px 0' },
        },
        propsSchema: [
            { key: 'size', type: 'text', label: 'Icon Size' },
            { key: 'gap', type: 'text', label: 'Gap' },
            { key: 'shape', type: 'select', label: 'Shape', options: ['circle', 'rounded', 'square'] },
            { key: 'style', type: 'select', label: 'Style', options: ['colored', 'outline'] },
            { key: 'facebook', type: 'text', label: 'Facebook URL' },
            { key: 'twitter', type: 'text', label: 'Twitter / X URL' },
            { key: 'instagram', type: 'text', label: 'Instagram URL' },
            { key: 'youtube', type: 'text', label: 'YouTube URL' },
            { key: 'tiktok', type: 'text', label: 'TikTok URL' },
            { key: 'linkedin', type: 'text', label: 'LinkedIn URL' },
            { key: 'github', type: 'text', label: 'GitHub URL' },
            { key: 'discord', type: 'text', label: 'Discord URL' },
            { key: 'twitch', type: 'text', label: 'Twitch URL' },
            { key: 'reddit', type: 'text', label: 'Reddit URL' },
        ],
        render: SocialRenderer,
    },
    map: {
        label: 'Map',
        icon: faMapMarkerAlt,
        category: 'media',
        canHaveChildren: false,
        defaultProps: { address: '', zoom: '15', height: '400px' },
        defaultStyles: {
            desktop: { width: '100%' },
        },
        propsSchema: [
            { key: 'address', type: 'text', label: 'Address or Place' },
            { key: 'zoom', type: 'select', label: 'Zoom', options: ['5', '8', '10', '12', '15', '18', '20'] },
            { key: 'height', type: 'text', label: 'Height' },
        ],
        render: MapRenderer,
    },
    embed: {
        label: 'Embed',
        icon: faCode,
        category: 'media',
        canHaveChildren: false,
        defaultProps: { src: '', height: '400px' },
        defaultStyles: {
            desktop: { width: '100%' },
        },
        propsSchema: [
            { key: 'src', type: 'text', label: 'Embed URL' },
            { key: 'height', type: 'text', label: 'Height' },
        ],
        render: EmbedRenderer,
    },
}

export const COMPONENT_CATEGORIES = [
    { key: 'layout', label: 'Layout' },
    { key: 'basic', label: 'Basic' },
    { key: 'media', label: 'Media & Advanced' },
]
