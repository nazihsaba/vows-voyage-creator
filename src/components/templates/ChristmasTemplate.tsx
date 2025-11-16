import { EditableField } from '@/components/EditableField';
import leavesDecor from '@/assets/christmas-leaves-decor.png';
import christmasTree from '@/assets/christmas-tree.png';
import textureBackground from '@/assets/christmas-texture.png';
import defaultBackground from '@/assets/christmas-default-bg.png';

interface ChristmasTemplateProps {
  wedding: any;
  locations: any[];
  giftCards: any[];
  isOwner?: boolean;
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
}

export const ChristmasTemplate = ({
  wedding,
  locations,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: ChristmasTemplateProps) => {
  const venue = locations.find(loc => loc.type === 'ceremony');

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-8"
      style={{ 
        background: '#f7f7f7',
        fontFamily: 'Georgia, serif'
      }}
    >
      <div 
        className="w-full max-w-md bg-white p-8 md:p-10 rounded-xl relative shadow-xl"
        style={{
          border: '3px solid #d4af37',
          backgroundImage: `url(${wedding.main_picture_url || defaultBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Decoration */}
        <div className="relative w-full flex justify-center mb-6">
          <img 
            src={leavesDecor} 
            alt="Decorative leaves" 
            className="w-full opacity-90"
          />
          <div className="absolute top-4 left-0 right-0 text-center">
            <div style={{ color: '#b8860b', fontWeight: 500 }}>
              <EditableField
                fieldId="recipient-name"
                text={getFieldValue("recipient-name", "DEAR SHINTA")}
                style={getFieldStyle("recipient-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-xs tracking-[0.3em] mb-1 uppercase"
              />
            </div>
            <div style={{ color: '#b8860b', fontWeight: 500 }}>
              <EditableField
                fieldId="invitation-text"
                text={getFieldValue("invitation-text", "PLEASE JOIN US")}
                style={getFieldStyle("invitation-text")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-xs tracking-[0.3em] uppercase"
              />
            </div>
          </div>
        </div>

        {/* Christmas Tree - Hidden when using default background */}
        {wedding.main_picture_url && wedding.main_picture_url !== defaultBackground && (
          <div className="flex justify-center my-6">
            <img 
              src={wedding.main_picture_url} 
              alt="Christmas decoration" 
              className="w-48 h-auto"
            />
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-6 mt-8">
          <div style={{ color: '#b8860b' }}>
            <EditableField
              fieldId="event-title"
              text={getFieldValue("event-title", "Christmas Dinner")}
              style={getFieldStyle("event-title")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h1"
              className="text-6xl mb-4 font-script"
            />
          </div>
        </div>

        {/* Decorative Line */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-px" style={{ backgroundColor: '#8a7646' }}></div>
        </div>

        {/* Details */}
        <div className="text-center mb-6 space-y-2">
          <div style={{ color: '#2c2c2c' }}>
            <EditableField
              fieldId="event-date"
              text={getFieldValue("event-date", new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + "st at " + (venue?.time || "6 P.M."))}
              style={getFieldStyle("event-date")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-base font-serif"
            />
          </div>
          {venue && (
            <div style={{ color: '#2c2c2c' }}>
              <EditableField
                fieldId="event-location"
                text={getFieldValue("event-location", venue.location_name || "123 Street Name, City, Country")}
                style={getFieldStyle("event-location")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-base font-serif"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div style={{ color: '#b8860b' }}>
            <EditableField
              fieldId="closing-message"
              text={getFieldValue("closing-message", `With Love, ${wedding.groom_name || wedding.bride_name || 'Emely'}`)}
              style={getFieldStyle("closing-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-lg"
            />
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="w-full flex justify-center mt-8">
          <img 
            src={leavesDecor} 
            alt="Decorative leaves" 
            className="w-full opacity-90"
          />
        </div>
      </div>
    </div>
  );
};
