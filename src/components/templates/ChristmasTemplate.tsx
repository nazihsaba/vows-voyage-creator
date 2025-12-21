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
      className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{ 
        background: '#f7f7f7',
        fontFamily: 'Georgia, serif'
      }}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md bg-white p-4 sm:p-6 md:p-10 rounded-xl relative shadow-xl"
        style={{
          border: '2px solid #d8c897',
          backgroundImage: `url(${wedding.main_picture_url || defaultBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Decoration */}
        <div className="w-full flex justify-center mb-3 sm:mb-4">
          <img 
            src={leavesDecor} 
            alt="Decorative leaves" 
            className="w-4/5 sm:w-3/4 opacity-90"
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-4 sm:mb-6">
          <EditableField
            fieldId="recipient-name"
            text={getFieldValue("recipient-name", "DEAR GUEST")}
            style={getFieldStyle("recipient-name")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-xs sm:text-sm tracking-widest mb-2"
          />
          <EditableField
            fieldId="invitation-text"
            text={getFieldValue("invitation-text", "PLEASE JOIN US")}
            style={getFieldStyle("invitation-text")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-xs sm:text-sm tracking-widest"
          />
        </div>

        {/* Christmas Tree - Hidden when using default background */}
        {wedding.main_picture_url && (
          <div className="flex justify-center my-4 sm:my-6">
            <img 
              src={wedding.main_picture_url} 
              alt="Christmas decoration" 
              className="w-32 sm:w-40 md:w-48 h-auto"
            />
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-3 sm:mb-4">
          <EditableField
            fieldId="event-title"
            text={getFieldValue("event-title", "Christmas Dinner")}
            style={getFieldStyle("event-title")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="h1"
            className="text-2xl sm:text-3xl md:text-4xl mb-2 font-serif"
          />
        </div>

        {/* Details */}
        <div className="text-center mb-4 sm:mb-6 text-gray-700">
          <EditableField
            fieldId="event-date"
            text={getFieldValue("event-date", new Date(wedding.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + " at " + (venue?.time || "6 P.M."))}
            style={getFieldStyle("event-date")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-sm sm:text-base leading-relaxed"
          />
          {venue && (
            <EditableField
              fieldId="event-location"
              text={getFieldValue("event-location", venue.location_name || "123 Street Name, City, Country")}
              style={getFieldStyle("event-location")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-sm sm:text-base leading-relaxed"
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
          <EditableField
            fieldId="closing-message"
            text={getFieldValue("closing-message", `With Love, ${wedding.groom_name || wedding.bride_name || 'The Host'}`)}
            style={getFieldStyle("closing-message")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-sm sm:text-base text-[#8a7646]"
          />
        </div>

        {/* Bottom Decoration */}
        <div className="w-full flex justify-center mt-4 sm:mt-6">
          <img 
            src={leavesDecor} 
            alt="Decorative leaves" 
            className="w-4/5 sm:w-3/4 opacity-90"
          />
        </div>
      </div>
    </div>
  );
};
