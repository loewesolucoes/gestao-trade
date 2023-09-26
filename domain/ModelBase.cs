using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace domain
{
    public abstract class ModelBase : ICreationTrackable, IModificationTrackable
    {
        //[Key]
        //[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        //public string Id { get; set; }
        [ScaffoldColumn(false)]
        public DateTime CreatedAt { get; set; }
        [ScaffoldColumn(false)]
        public DateTime? ModifiedAt { get; set; }
    }

    public interface ICreationTrackable
    {
        public DateTime CreatedAt { get; set; }
    }

    public interface IModificationTrackable
    {
        public DateTime? ModifiedAt { get; set; }
    }

    public interface ISoftDeletable
    {
        public DateTime? DeletedAt { get; set; }
    }
}

